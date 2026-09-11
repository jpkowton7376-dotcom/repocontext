import { NextResponse } from "next/server"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"
import { sendWaitlistConfirmEmail } from "@/lib/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TABLE = "waitlist"

/**
 * Collects a waitlist signup from the homepage CTA.
 *
 * Duplicate addresses are treated as a success rather than an error: from
 * the visitor's point of view "you're already on the list" is the same
 * outcome, and returning 409 would just make people click again.
 */
export async function POST(request: Request) {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const source = typeof body?.source === "string" ? body.source.slice(0, 60) : "homepage"
  const locale = typeof body?.locale === "string" ? body.locale.slice(0, 20) : null

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "a valid email is required" },
      { status: 400 },
    )
  }

  // ── Persist (best-effort) ──────────────────────────────────────────────
  let saved = false
  let duplicate = false
  if (isSupabaseConfigured()) {
    const admin = createAdminClient()
    if (admin) {
      const { error } = await admin
        .from(TABLE)
        .upsert({ email, source, locale }, { onConflict: "email" })
      if (error) {
        // 23505 = unique_violation. Upsert normally absorbs it, but a race
        // between two submits can still surface it.
        if (error.code === "23505") {
          duplicate = true
          saved = true
        } else {
          console.error("[waitlist] insert failed:", error.message)
        }
      } else {
        saved = true
      }
    }
  } else {
    console.warn("[waitlist] Supabase not configured — email not stored:", email)
  }

  const confirmation = await sendWaitlistConfirmEmail(email)

  return NextResponse.json({
    ok: true,
    saved,
    duplicate,
    confirmationSent: confirmation.ok,
  })
}
