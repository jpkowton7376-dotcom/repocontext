import { NextResponse } from "next/server"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"
import {
  sendSupportAckEmail,
  sendSupportNotificationEmail,
} from "@/lib/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TABLE = "support_messages"
const MAX_MESSAGE_LENGTH = 4000

/**
 * Receives a message typed into the on-site support widget.
 *
 * Two things happen, and the caller is told which ones worked:
 *   1. the message is emailed to the support inbox (works with no database
 *      at all, as long as RESEND_API_KEY is set);
 *   2. it is stored in `support_messages` so it can be triaged later.
 *
 * If the email can't be sent we return 502 — silently accepting the message
 * and telling the visitor "we got it" would be worse than an honest error.
 */
export async function POST(request: Request) {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  const message = typeof body?.message === "string" ? body.message.trim() : ""
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const page = typeof body?.page === "string" ? body.page.slice(0, 300) : ""

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `message is too long (max ${MAX_MESSAGE_LENGTH} characters)` },
      { status: 400 },
    )
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 })
  }

  const stored = await persist({
    email: email || null,
    message,
    page: page || null,
    userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
    locale: (body?.locale as string | undefined)?.slice(0, 20) ?? null,
  })

  const notification = await sendSupportNotificationEmail({
    message,
    replyTo: email || undefined,
    page: page || "/",
  })

  if (!notification.ok && !stored.saved) {
    // Neither channel worked: the message is gone, so say so. The widget
    // then offers a plain mailto so the visitor still has a way through.
    return NextResponse.json(
      {
        ok: false,
        error: notification.error || "failed to send message",
        stored,
      },
      { status: 502 },
    )
  }

  // Best-effort acknowledgement; a failure here must not fail the request.
  if (email) void sendSupportAckEmail(email)

  return NextResponse.json({ ok: true, stored })
}

/** Inserts the message. Missing table / unset Supabase is not fatal. */
async function persist(row: {
  email: string | null
  message: string
  page: string | null
  userAgent: string | null
  locale: string | null
}): Promise<{ saved: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { saved: false, error: "supabase not configured" }
  }
  const admin = createAdminClient()
  if (!admin) return { saved: false, error: "service role key missing" }

  try {
    const { error } = await admin.from(TABLE).insert({
      email: row.email,
      message: row.message,
      page: row.page,
      user_agent: row.userAgent,
      locale: row.locale,
      status: "new",
    })
    if (error) {
      // Missing table is an operator problem, not a visitor problem.
      console.error("[support] insert failed:", error.message)
      return { saved: false, error: error.message }
    }
    return { saved: true }
  } catch (err: any) {
    console.error("[support] insert threw:", err)
    return { saved: false, error: err?.message || "insert failed" }
  }
}
