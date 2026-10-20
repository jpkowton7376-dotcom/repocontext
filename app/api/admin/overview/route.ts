import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/admin/overview — cross-product metrics for the internal admin panel.
 *
 * Everything here spans ALL users, so it must run under the service-role
 * client (RLS would otherwise restrict each query to the caller's own rows).
 * Each metric degrades to a safe default if its table is missing, so one
 * un-migrated table never blanks the whole dashboard.
 */

function startOfTodayUTC(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

function daysAgoUTC(days: number): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

/** Buckets created_at rows into the last 14 days (ending today, UTC). */
function toDailyBuckets(rows: Array<{ created_at: string }>): Array<{ date: string; count: number }> {
  const buckets = new Map<string, number>()
  for (let i = 0; i < 14; i++) {
    buckets.set(daysAgoUTC(13 - i).slice(0, 10), 0)
  }
  for (const row of rows) {
    const key = row.created_at?.slice(0, 10)
    if (key && buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1)
  }
  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }))
}

/** Exact count, or 0 when the query errors (e.g. table missing). */
async function safeCount(
  admin: any,
  table: string,
  apply?: (q: any) => any,
): Promise<number> {
  try {
    let q = admin.from(table).select("*", { count: "exact", head: true })
    if (apply) q = apply(q)
    const { count, error } = await q
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  const today = startOfTodayUTC()
  const since14 = daysAgoUTC(13)

  // ── Counts (independent — run together) ─────────────────────────────
  const [
    analysesTotal,
    analysesToday,
    apiKeysTotal,
    apiKeysActive,
    waitlistTotal,
    sharesTotal,
    supportNew,
    pageViewsTotal,
    pageViewsToday,
  ] = await Promise.all([
    safeCount(admin, "analyses"),
    safeCount(admin, "analyses", (q) => q.gte("created_at", today)),
    safeCount(admin, "api_keys"),
    safeCount(admin, "api_keys", (q) => q.is("revoked_at", null)),
    safeCount(admin, "waitlist"),
    safeCount(admin, "shared_analyses"),
    safeCount(admin, "support_messages", (q) => q.eq("status", "new")),
    safeCount(admin, "page_views"),
    safeCount(admin, "page_views", (q) => q.gte("created_at", today)),
  ])

  // ── Data pulls (independent — run together, each guarded) ───────────
  const [
    profilesRes,
    dailyRes,
    recentRes,
    topRes,
    waitlistRecentRes,
    pvDailyRes,
    pvTopRes,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("plan, created_at, creem_customer_id")
      .limit(100000),
    admin
      .from("analyses")
      .select("created_at")
      .gte("created_at", since14)
      .limit(20000),
    admin
      .from("analyses")
      .select("id, repo_name, repo_url, quality_score, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(15),
    admin
      .from("analyses")
      .select("repo_name")
      .order("created_at", { ascending: false })
      .limit(1000),
    admin
      .from("waitlist")
      .select("email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("page_views")
      .select("created_at")
      .gte("created_at", since14)
      .limit(50000),
    admin
      .from("page_views")
      .select("path")
      .order("created_at", { ascending: false })
      .limit(2000),
  ])

  const profiles = (profilesRes.data ?? []) as Array<{
    plan: string | null
    created_at: string
    creem_customer_id: string | null
  }>
  const plans = { free: 0, pro: 0, team: 0 }
  let usersToday = 0
  let withCreem = 0
  for (const p of profiles) {
    if (p.plan === "pro") plans.pro += 1
    else if (p.plan === "team") plans.team += 1
    else plans.free += 1
    if (p.created_at && p.created_at >= today) usersToday += 1
    if (p.creem_customer_id) withCreem += 1
  }

  // ── Daily analysis trend (last 14 days, ending today) ───────────────
  const daily = toDailyBuckets((dailyRes.data ?? []) as Array<{ created_at: string }>)

  // ── Page-view trend + top pages ─────────────────────────────────────
  const pvDaily = toDailyBuckets((pvDailyRes.data ?? []) as Array<{ created_at: string }>)
  const pvCounts = new Map<string, number>()
  for (const row of (pvTopRes.data ?? []) as Array<{ path: string }>) {
    const path = row.path || "(unknown)"
    pvCounts.set(path, (pvCounts.get(path) || 0) + 1)
  }
  const pvTop = Array.from(pvCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }))

  // ── Top analyzed repos ──────────────────────────────────────────────
  const repoCounts = new Map<string, number>()
  for (const row of (topRes.data ?? []) as Array<{ repo_name: string | null }>) {
    const name = row.repo_name || "(unknown)"
    repoCounts.set(name, (repoCounts.get(name) || 0) + 1)
  }
  const topRepos = Array.from(repoCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))

  // ── Attach emails to recent analyses (best-effort) ──────────────────
  const recentRaw = (recentRes.data ?? []) as Array<{
    id: string
    repo_name: string | null
    repo_url: string | null
    quality_score: number | null
    created_at: string
    user_id: string | null
  }>
  const userIds = Array.from(new Set(recentRaw.map((r) => r.user_id).filter(Boolean))) as string[]
  let emailByUserId = new Map<string, string>()
  if (userIds.length > 0) {
    const { data: profs } = await admin
      .from("profiles")
      .select("id, email")
      .in("id", userIds)
    emailByUserId = new Map(
      ((profs ?? []) as Array<{ id: string; email: string | null }>).map((p) => [
        p.id,
        p.email || "—",
      ]),
    )
  }
  const recent = recentRaw.map((r) => ({
    id: r.id,
    repo_name: r.repo_name,
    repo_url: r.repo_url,
    quality_score: r.quality_score,
    created_at: r.created_at,
    email: r.user_id ? emailByUserId.get(r.user_id) || "—" : "anonymous",
  }))

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    users: { total: profiles.length, today: usersToday },
    analyses: {
      total: analysesTotal,
      today: analysesToday,
      daily,
      topRepos,
      recent,
    },
    plans,
    subscribers: {
      paid: plans.pro + plans.team,
      withCreem,
    },
    apiKeys: { active: apiKeysActive, total: apiKeysTotal },
    waitlist: {
      total: waitlistTotal,
      recent: (waitlistRecentRes.data ?? []) as Array<{
        email: string
        source: string
        created_at: string
      }>,
    },
    shares: { total: sharesTotal },
    support: { new: supportNew },
    pageViews: {
      total: pageViewsTotal,
      today: pageViewsToday,
      daily: pvDaily,
      top: pvTop,
    },
  })
}
