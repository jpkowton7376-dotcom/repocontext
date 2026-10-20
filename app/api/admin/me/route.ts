import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/admin/me — lightweight "is the current user an admin?" probe.
 *
 * Used by the regular dashboard to decide whether to show the Admin entry
 * link. Always returns 200 with { admin } so the client never has to treat a
 * 401/403 as an error — a signed-out or non-admin user simply gets admin:false.
 */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ admin: false, email: "" })
  }
  return NextResponse.json({ admin: true, email: auth.email })
}
