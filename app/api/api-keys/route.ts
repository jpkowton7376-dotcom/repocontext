import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase"
import {
  generateApiKey,
  MAX_KEYS_PER_USER,
  DEFAULT_RATE_LIMIT,
  isWellFormed,
} from "@/lib/api-keys"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Lists the signed-in user's API keys (without the hash). The response
 * intentionally never contains anything the user could use to call the
 * public API — only the prefix ("rc_live_aB3x…") is returned.
 */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }
  const { data, error } = await admin
    .from("api_keys")
    .select("id, key_prefix, name, revoked_at, last_used_at, rate_limit_per_minute, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ keys: data ?? [] })
}

/**
 * Creates a new API key. The plaintext is returned ONCE in the response
 * — never again. After creation, only the prefix and hash remain in
 * the database.
 *
 * Body: { name?: string }
 */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine
  }
  const name = (typeof body?.name === "string" ? body.name : "API key")
    .trim()
    .slice(0, 60) || "API key"

  const generated = generateApiKey()
  if (!generated) {
    return NextResponse.json(
      { error: "Failed to generate key. Try again." },
      { status: 500 },
    )
  }

  const { data, error } = await admin
    .from("api_keys")
    .insert({
        user_id: user.id,
        key_hash: generated.hash,
        key_prefix: generated.prefix,
        name,
        rate_limit_per_minute: DEFAULT_RATE_LIMIT,
      })
    .select("id, key_prefix, name, rate_limit_per_minute, created_at")
    .maybeSingle()

  if (error) {
    console.error("[api-keys] insert failed:", error)
    // Friendly copy for the per-user cap.
    if (/at most/i.test(error.message)) {
      return NextResponse.json(
        { error: `You can have at most ${MAX_KEYS_PER_USER} active API keys. Revoke one first.` },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: data?.id,
    prefix: data?.key_prefix,
    name: data?.name,
    rateLimitPerMinute: data?.rate_limit_per_minute,
    createdAt: data?.created_at,
    // Plaintext is returned EXACTLY ONCE — copy it before closing the dialog.
    plaintext: generated.plaintext,
    warning: "Copy this key now. For security, it will never be shown again.",
  })
}

// Silence unused-import warning in build if isWellFormed isn't used.
void isWellFormed