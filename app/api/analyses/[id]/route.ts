import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/analyses/[id] — read back one of the signed-in user's own saved
 * analyses (the dashboard's "recent analyses" list links here). Scoped by
 * user_id so one account can never read another's history.
 *
 * DELETE /api/analyses/[id] — remove an entry from the user's history.
 *
 * The full payload (formats / audit / evidence) isn't stored — only the
 * AGENTS.md text plus the repo/score metadata — so this route returns
 * exactly that, and the history page renders it honestly.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  const { data, error } = await admin
    .from("analyses")
    .select("id, repo_name, repo_url, quality_score, agents_md, created_at")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
  }
  return NextResponse.json({ analysis: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  const { error, count } = await admin
    .from("analyses")
    .delete({ count: "exact" })
    .eq("id", params.id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!count) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
