import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET  /api/admin/admins — list current admins (profiles.is_admin = true).
 * POST /api/admin/admins — promote/demote a user. Body: { userId, isAdmin }.
 *
 * Service-role only. The is_admin guard trigger (supabase/admin.sql) only
 * lets the service_role change the flag, so this route is the single place
 * admin status can be flipped at runtime.
 */

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id, email, is_admin, created_at")
    .eq("is_admin", true)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({
    admins: (data ?? []) as Array<{
      id: string
      email: string | null
      is_admin: boolean
      created_at: string
    }>,
  })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  const userId = typeof body?.userId === "string" ? body.userId : ""
  const isAdmin = body?.isAdmin === true
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  // Guard against locking everyone out: never remove the last DB admin.
  if (!isAdmin) {
    const { count } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_admin", true)
    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last admin. Promote another admin first." },
        { status: 400 },
      )
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, userId, isAdmin })
}
