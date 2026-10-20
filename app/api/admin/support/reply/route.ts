import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"
import { sendSupportReplyEmail } from "@/lib/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/admin/support/reply — email a reply to a support message's author.
 *
 * Body: { id, reply }
 *   1. loads the message (to get the recipient + quote the original),
 *   2. sends the reply via Resend,
 *   3. on success, best-effort marks the message "resolved".
 *
 * No-op (502) when the message has no email address or RESEND_API_KEY is unset.
 */
const MAX_REPLY = 8000

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

  const id = typeof body?.id === "string" ? body.id : ""
  const reply = typeof body?.reply === "string" ? body.reply.trim() : ""
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }
  if (!reply) {
    return NextResponse.json({ error: "reply text is required" }, { status: 400 })
  }
  if (reply.length > MAX_REPLY) {
    return NextResponse.json(
      { error: `reply is too long (max ${MAX_REPLY} characters)` },
      { status: 400 },
    )
  }

  const { data: msg, error } = await admin
    .from("support_messages")
    .select("id, email, message")
    .eq("id", id)
    .maybeSingle()

  if (error || !msg) {
    return NextResponse.json({ error: "message not found" }, { status: 404 })
  }
  if (!msg.email) {
    return NextResponse.json(
      { error: "This message has no reply-to address (submitted anonymously)." },
      { status: 422 },
    )
  }

  const result = await sendSupportReplyEmail({
    to: msg.email,
    reply,
    original: msg.message || undefined,
  })
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "failed to send reply" },
      { status: 502 },
    )
  }

  // Best-effort: a sent reply implies the thread is handled. Don't fail the
  // request if this update errors — the email already went out.
  await admin.from("support_messages").update({ status: "resolved" }).eq("id", id)

  return NextResponse.json({ ok: true })
}
