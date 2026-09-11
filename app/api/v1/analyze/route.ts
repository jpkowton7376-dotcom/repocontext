import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import {
  DEFAULT_RATE_LIMIT,
  consumeRateLimit,
  extractBearer,
  verifyApiKey,
  touchApiKey,
} from "@/lib/api-keys"
import { runAnalysis } from "@/lib/analyze-pipeline"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Public REST API entry point. Use an API key created in the dashboard:
 *
 *   curl -X POST https://repocontext.com/api/v1/analyze \
 *     -H "Authorization: Bearer rc_live_xxx" \
 *     -H "Content-Type: application/json" \
 *     -d '{"repoUrl":"https://github.com/octocat/Hello-World"}'
 *
 * The response shape mirrors the JSON returned to the dashboard client
 * so existing integrations that already parse it will work unchanged.
 */
export async function POST(request: Request) {
  // ── 1. Resolve bearer token ────────────────────────────────────────────
  const token = extractBearer(request.headers.get("authorization"))
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Missing API key. Send it as 'Authorization: Bearer rc_live_xxx'.",
      },
      { status: 401 },
    )
  }

  // ── 2. Verify against the api_keys table ───────────────────────────────
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 503 },
    )
  }
  const verified = await verifyApiKey(admin, token)
  if (!verified.ok) {
    if (verified.reason === "malformed") {
      return NextResponse.json(
        { error: "Malformed API key. Keys look like 'rc_live_<43 chars>'." },
        { status: 401 },
      )
    }
    if (verified.reason === "revoked") {
      return NextResponse.json(
        {
          error:
            "This API key was revoked. Create a new one in your dashboard.",
        },
        { status: 401 },
      )
    }
    return NextResponse.json(
      { error: "Invalid API key." },
      { status: 401 },
    )
  }
  const apiKey = verified.key

  // ── 3. Resolve the key owner's plan ────────────────────────────────────
  const { data: profile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", apiKey.user_id)
    .maybeSingle()
  const isPaid = profile?.plan === "pro" || profile?.plan === "team"

  // ── 4. Body validation ─────────────────────────────────────────────────
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    // empty body — we treat as missing repoUrl below
  }
  const repoUrl: string | undefined = body?.repoUrl
  if (!repoUrl || typeof repoUrl !== "string") {
    return NextResponse.json(
      { error: "Body must include { repoUrl: string }." },
      { status: 400 },
    )
  }

  // ── 5. Enforce the per-key rate limit ─────────────────────────────────
  // Counted before the analysis runs so a rejected call costs no GitHub
  // quota and no LLM tokens. If the counter table is missing this fails
  // open (see consumeRateLimit).
  const rate = await consumeRateLimit(
    admin,
    apiKey.id,
    apiKey.rate_limit_per_minute || DEFAULT_RATE_LIMIT,
  )
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded: ${rate.limit} requests per minute for this API key.`,
        retryAfterSeconds: rate.resetInSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.resetInSeconds),
          "X-RateLimit-Limit": String(rate.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rate.resetInSeconds),
        },
      },
    )
  }

  // ── 6. Run the analysis ────────────────────────────────────────────────
  try {
    const result = await runAnalysis({
      repoUrl,
      githubToken: null,
      isPaid,
      usePaidModel: isPaid, // API consumers don't get the public Pro trial
    })

    // Persist to history (best-effort) and touch last_used_at.
    try {
      await admin.from("analyses").insert({
        user_id: apiKey.user_id,
        repo_url: result.repo.url,
        repo_name: result.repo.fullName,
        quality_score: result.quality.score,
        agents_md: result.agentsMd,
      })
    } catch (err) {
      console.error("[v1/analyze] persist failed:", err)
    }
    void touchApiKey(admin, apiKey.id)

    return NextResponse.json(
      {
        ...result,
        meta: {
          apiKey: { id: apiKey.id, prefix: apiKey.key_prefix },
          plan: profile?.plan || "free",
          rateLimit: {
            limit: rate.limit,
            remaining: rate.remaining,
            resetInSeconds: rate.resetInSeconds,
          },
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rate.limit),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(rate.resetInSeconds),
        },
      },
    )
  } catch (err: any) {
    console.error("[v1/analyze] failed:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to analyze repository" },
      { status: 500 },
    )
  }
}