import { NextResponse } from "next/server"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"

export const runtime = "nodejs"

/**
 * Public share links for analysis results.
 *
 * Required table (run once in the Supabase SQL editor):
 *
 *   create table if not exists shared_analyses (
 *     id             text primary key,
 *     repo_full_name text not null,
 *     payload        jsonb not null,
 *     created_at     timestamptz not null default now()
 *   );
 *
 *   -- Public read is intentional: anyone with the link can view a share.
 *   alter table shared_analyses enable row level security;
 *   create policy "public read shares" on shared_analyses
 *     for select using (true);
 *
 * Writes/reads go through the service-role client so no user session is needed.
 */
const TABLE = "shared_analyses"

/** Detects "table does not exist" coming back from PostgREST / the schema cache. */
function isMissingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const msg = error.message?.toLowerCase() ?? ""
  return (
    error.code === "PGRST205" || // table not found in schema cache
    error.code === "42P01" || // undefined_table
    (msg.includes(TABLE) && (msg.includes("could not find") || msg.includes("schema cache") || msg.includes("does not exist")))
  )
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Sharing requires Supabase. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY to .env.local",
        },
        { status: 503 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const payload = body?.payload
    if (!payload) {
      return NextResponse.json({ error: "payload is required" }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { error: "Supabase admin client unavailable (missing SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 503 },
      )
    }

    const id = crypto.randomUUID()
    const { error } = await admin.from(TABLE).insert({
      id,
      repo_full_name: payload?.repo?.fullName ?? "unknown",
      payload,
    })

    if (error) {
      // The table hasn't been created yet — give an actionable pointer instead of a raw 500.
      if (isMissingTable(error)) {
        return NextResponse.json(
          {
            error:
              "Sharing isn't set up yet. Run supabase/shared_analyses.sql in your Supabase SQL editor, then try again.",
            needsMigration: true,
          },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: `Failed to save share: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ id })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create share" },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Sharing unavailable" }, { status: 503 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { error: "Supabase admin client unavailable" },
        { status: 503 },
      )
    }

    const { data, error } = await admin
      .from(TABLE)
      .select("payload, repo_full_name, created_at")
      .eq("id", id)
      .single()

    if (error && isMissingTable(error)) {
      return NextResponse.json(
        {
          error:
            "Sharing isn't set up yet. Run supabase/shared_analyses.sql in your Supabase SQL editor.",
          needsMigration: true,
        },
        { status: 503 },
      )
    }
    if (error || !data) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 })
    }

    return NextResponse.json({
      payload: data.payload,
      repoFullName: data.repo_full_name,
      createdAt: data.created_at,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load share" },
      { status: 500 },
    )
  }
}