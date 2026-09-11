import { NextResponse } from "next/server"
import { emailConfigured, sendWelcomeEmail } from "@/lib/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Triggers the welcome email for a freshly-signed-up user.
 *
 * Public (no auth) because the user often does not have a session yet
 * when this fires (Supabase's email confirmation is the slower path).
 * To keep abuse low we accept the call only from our own origin and
 * require a valid email shape. A real attacker could still send mail
 * to anyone, but they would have to know that address and the only
 * cost is a welcome email landing in their inbox.
 */
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin") || ""
    const expectedOrigin =
      process.env.NEXT_PUBLIC_SITE_URL || "https://repocontext.vercel.app"
    // Allow same-origin (browser fetch) and direct server-to-server calls
    // (Vercel preview / production). Block everything else.
    if (origin && !origin.startsWith(expectedOrigin)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const email = (body?.email as string | undefined)?.trim()
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: "valid email is required" },
        { status: 400 },
      )
    }

    const result = await sendWelcomeEmail(email)
    if (!result.ok) {
      // Do not surface "not configured" as a 500 — that's an expected
      // dev-mode state, not a failure to handle.
      const status = result.error === "email service not configured" ? 200 : 500
      return NextResponse.json(
        { ok: false, error: result.error, configured: emailConfigured },
        { status },
      )
    }
    return NextResponse.json({ ok: true, configured: emailConfigured })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "unexpected error" },
      { status: 500 },
    )
  }
}
