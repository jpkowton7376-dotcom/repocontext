import { NextResponse } from "next/server"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Fire-and-forget page-view beacon. The client PageViewTracker POSTs here once
 * per route change. Writes go through the service role; the page_views table
 * has RLS on with no policies, so the anon key can never read it.
 *
 * Deliberately forgiving: any malformed or missing payload is accepted with
 * { ok: true } so the beacon never surfaces an error to the visitor, and a
 * missing table / unset Supabase is a silent no-op.
 */
export async function POST(request: Request) {
  let body: any = {}
  try {
    body = await request.json()
  } catch {
    // ignore — treated as junk below
  }

  const path = typeof body?.path === "string" ? body.path.slice(0, 300) : ""
  const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 300) : ""
  const locale = typeof body?.locale === "string" ? body.locale.slice(0, 20) : ""

  if (!path || !path.startsWith("/")) {
    return NextResponse.json({ ok: true })
  }

  if (isSupabaseConfigured()) {
    const admin = createAdminClient()
    if (admin) {
      try {
        await admin.from("page_views").insert({
          path,
          referrer: referrer || null,
          locale: locale || null,
        })
      } catch (err) {
        console.error("[track] insert failed:", err)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
