import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/admin/subscribers — every user + plan + Creem subscription linkage,
 * plus the feature waitlist. Service-role only (spans all users).
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

  const [profilesRes, waitlistRes] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, email, plan, total_analyses, created_at, creem_customer_id, creem_subscription_id, is_admin",
      )
      .order("created_at", { ascending: false })
      .limit(500),
    admin
      .from("waitlist")
      .select("email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ])

  const profiles = (profilesRes.data ?? []) as Array<{
    id: string
    email: string | null
    plan: string
    total_analyses: number
    created_at: string
    creem_customer_id: string | null
    creem_subscription_id: string | null
    is_admin: boolean
  }>

  const planCounts = { free: 0, pro: 0, team: 0 }
  for (const p of profiles) {
    if (p.plan === "pro") planCounts.pro += 1
    else if (p.plan === "team") planCounts.team += 1
    else planCounts.free += 1
  }

  return NextResponse.json({
    profiles,
    planCounts,
    waitlist: (waitlistRes.data ?? []) as Array<{
      email: string
      source: string
      created_at: string
    }>,
  })
}
