import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET   /api/admin/support — list inbound customer-service messages.
 * PATCH /api/admin/support — update a message's triage status.
 *
 * Service-role only: these messages have RLS on with no policies, so the
 * anon/browser client can never read or write them.
 */

const TABLE = "support_messages"
const ALLOWED_STATUS = ["new", "open", "resolved", "closed"] as const

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
    .from(TABLE)
    .select("id, email, message, page, user_agent, locale, status, created_at")
    .order("created_at", { ascending: false })
    .limit(150)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const messages = (data ?? []) as Array<{
    id: string
    email: string | null
    message: string
    page: string | null
    user_agent: string | null
    locale: string | null
    status: string
    created_at: string
  }>

  const byStatus: Record<string, number> = { new: 0, open: 0, resolved: 0, closed: 0 }
  for (const m of messages) {
    byStatus[m.status] = (byStatus[m.status] || 0) + 1
  }

  return NextResponse.json({ messages, byStatus })
}

export async function PATCH(request: Request) {
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

  const id = typeof body?.id === "string" ? body.id : ""
  const status = typeof body?.status === "string" ? body.status : ""
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }
  if (!ALLOWED_STATUS.includes(status as any)) {
    return NextResponse.json(
      { error: `status must be one of: ${ALLOWED_STATUS.join(", ")}` },
      { status: 400 },
    )
  }

  const { data, error } = await admin
    .from(TABLE)
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, updated: data })
}
