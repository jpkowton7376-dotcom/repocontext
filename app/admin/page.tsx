"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

/**
 * Internal admin panel — visit/usage data, subscribers, and support records.
 *
 * Authorization is enforced server-side (ADMIN_EMAILS allowlist); this page is
 * just the UI. It calls the /api/admin/* routes, which read under the service
 * role, so the data spans all users. Visual language mirrors /dashboard.
 */

interface Overview {
  generatedAt: string
  users: { total: number; today: number }
  analyses: {
    total: number
    today: number
    daily: Array<{ date: string; count: number }>
    topRepos: Array<{ name: string; count: number }>
    recent: Array<{
      id: string
      repo_name: string | null
      repo_url: string | null
      quality_score: number | null
      created_at: string
      email: string
    }>
  }
  plans: { free: number; pro: number; team: number }
  subscribers: { paid: number; withCreem: number }
  apiKeys: { active: number; total: number }
  waitlist: { total: number; recent: Array<{ email: string; source: string; created_at: string }> }
  shares: { total: number }
  support: { new: number }
  pageViews: {
    total: number
    today: number
    daily: Array<{ date: string; count: number }>
    top: Array<{ path: string; count: number }>
  }
}

interface SubscriberRow {
  id: string
  email: string | null
  plan: string
  total_analyses: number
  created_at: string
  creem_customer_id: string | null
  creem_subscription_id: string | null
}

interface SupportMessage {
  id: string
  email: string | null
  message: string
  page: string | null
  user_agent: string | null
  locale: string | null
  status: string
  created_at: string
}

type Tab = "overview" | "subscribers" | "support"

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  if (diffMs < 0) return "just now"
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  new: { bg: "#fff4e5", fg: "#cc6600" },
  open: { bg: "#e8f0ff", fg: "#0043ce" },
  resolved: { bg: "#e6f6ec", fg: "#198038" },
  closed: { bg: "#f0f0f0", fg: "#6f6f6f" },
}

const PLAN_STYLE: Record<string, { bg: string; fg: string }> = {
  pro: { bg: "#e8f0ff", fg: "#0043ce" },
  team: { bg: "#efe6fb", fg: "#6929c4" },
  free: { bg: "#f0f0f0", fg: "#6f6f6f" },
}

function Badge({ text, style }: { text: string; style: { bg: string; fg: string } }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        borderRadius: "4px",
        background: style.bg,
        color: style.fg,
      }}
    >
      {text}
    </span>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--rule)",
        padding: "20px 22px",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: "12px", color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: "30px", fontWeight: 600, color: "var(--ink)", marginTop: "8px", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "12px", color: "var(--muted-2)", marginTop: "4px" }}>{sub}</div>}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("overview")
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<"loading" | "ready" | "forbidden" | "unconfigured" | "error">("loading")
  const [adminEmail, setAdminEmail] = useState<string>("")

  const [overview, setOverview] = useState<Overview | null>(null)
  const [subscribers, setSubscribers] = useState<SubscriberRow[] | null>(null)
  const [subPlanCounts, setSubPlanCounts] = useState({ free: 0, pro: 0, team: 0 })
  const [waitlist, setWaitlist] = useState<Array<{ email: string; source: string; created_at: string }>>([])
  const [support, setSupport] = useState<SupportMessage[] | null>(null)
  const [supportByStatus, setSupportByStatus] = useState<Record<string, number>>({})
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "team">("all")
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null)
  const [savingStatus, setSavingStatus] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [replying, setReplying] = useState<string | null>(null)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [replyDone, setReplyDone] = useState<string | null>(null)

  // ── Initial load: verify session + admin, then load the overview ──────
  useEffect(() => {
    let alive = true
    async function init() {
      if (!isSupabaseConfigured()) {
        if (alive) {
          setState("unconfigured")
          setLoading(false)
        }
        return
      }
      const {
        data: { session },
      } = await supabase!.auth.getSession()
      if (!alive) return
      if (!session) {
        router.replace("/login?next=/admin")
        return
      }
      setAdminEmail(session.user.email || "")
      try {
        const res = await fetch("/api/admin/overview")
        if (!alive) return
        if (res.status === 401) {
          router.replace("/login?next=/admin")
          return
        }
        if (res.status === 403) {
          setState("forbidden")
          setLoading(false)
          return
        }
        if (!res.ok) throw new Error("failed to load overview")
        setOverview(await res.json())
        setState("ready")
        setLoading(false)
      } catch {
        if (!alive) return
        setState("error")
        setLoading(false)
      }
    }
    init()
    return () => {
      alive = false
    }
  }, [router])

  const loadSubscribers = useCallback(async () => {
    if (subscribers) return
    try {
      const res = await fetch("/api/admin/subscribers")
      if (!res.ok) throw new Error("failed")
      const json = await res.json()
      setSubscribers(json.profiles)
      setSubPlanCounts(json.planCounts)
      setWaitlist(json.waitlist)
    } catch {
      setSubscribers([])
    }
  }, [subscribers])

  const loadSupport = useCallback(async () => {
    if (support) return
    try {
      const res = await fetch("/api/admin/support")
      if (!res.ok) throw new Error("failed")
      const json = await res.json()
      setSupport(json.messages)
      setSupportByStatus(json.byStatus)
    } catch {
      setSupport([])
    }
  }, [support])

  const switchTab = (t: Tab) => {
    setTab(t)
    if (t === "subscribers") void loadSubscribers()
    if (t === "support") void loadSupport()
  }

  const changeSupportStatus = async (id: string, status: string) => {
    setSavingStatus(id)
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setSupport((prev) =>
          prev ? prev.map((m) => (m.id === id ? { ...m, status } : m)) : prev,
        )
        setSupportByStatus((prev) => ({ ...prev, [status]: (prev[status] || 0) + 1 }))
      }
    } finally {
      setSavingStatus(null)
    }
  }

  const sendReply = async (id: string) => {
    const reply = (replyDrafts[id] || "").trim()
    if (!reply) return
    setReplying(id)
    setReplyError(null)
    setReplyDone(null)
    try {
      const res = await fetch("/api/admin/support/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reply }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setReplyError(json.error || "Failed to send reply")
      } else {
        setReplyDone(id)
        setReplyDrafts((prev) => ({ ...prev, [id]: "" }))
        // A sent reply marks the thread resolved (server also does this).
        setSupport((prev) =>
          prev ? prev.map((m) => (m.id === id ? { ...m, status: "resolved" } : m)) : prev,
        )
      }
    } catch {
      setReplyError("Failed to send reply")
    } finally {
      setReplying(null)
    }
  }

  // ── Chrome (shared across states) ─────────────────────────────────────
  const chrome = (children: React.ReactNode) => (
    <main style={{ minHeight: "100vh", background: "var(--bg-warm)" }}>
      <div style={{ height: "4px", background: "var(--blue-60)" }} />
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: "60px",
          borderBottom: "1px solid var(--rule)",
          background: "var(--surface)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "30px", height: "30px", position: "relative" }}>
            <Image src="/logo.png" alt="RepoContext" fill sizes="30px" style={{ objectFit: "contain" }} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)" }}>RepoContext</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--blue-60)",
              background: "var(--accent-light)",
              padding: "3px 8px",
              borderRadius: "4px",
              marginLeft: "4px",
            }}
          >
            Admin
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13px" }}>
          {adminEmail && <span style={{ color: "var(--muted)" }}>{adminEmail}</span>}
          <Link href="/dashboard" style={{ color: "var(--blue-60)", textDecoration: "none" }}>
            Dashboard
          </Link>
        </div>
      </nav>
      {children}
    </main>
  )

  // ── States ────────────────────────────────────────────────────────────
  if (state === "unconfigured") {
    return chrome(
      <Center>
        <h1 style={h1}>Admin unavailable</h1>
        <p style={p}>Supabase is not configured, so there is no data to show.</p>
      </Center>,
    )
  }

  if (state === "forbidden") {
    return chrome(
      <Center>
        <h1 style={h1}>Not authorized</h1>
        <p style={p}>This panel is restricted to admins.</p>
        {adminEmail ? (
          <div
            style={{
              marginTop: "16px",
              textAlign: "left",
              background: "var(--surface)",
              border: "1px solid var(--rule)",
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px" }}>
              You're signed in as
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)", wordBreak: "break-all" }}>
              {adminEmail}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "12px", lineHeight: 1.6 }}>
              Add this exact address to the{" "}
              <code style={{ background: "var(--bg-cool)", padding: "1px 5px" }}>ADMIN_EMAILS</code>{" "}
              environment variable in your host (Vercel → Project → Settings → Environment Variables),
              then <strong style={{ color: "var(--ink-2)" }}>redeploy</strong>. Multiple admins: separate
              addresses with commas.
            </div>
          </div>
        ) : (
          <p style={{ ...p, marginTop: "8px" }}>
            Add your email to the{" "}
            <code style={{ background: "var(--bg-cool)", padding: "1px 5px" }}>ADMIN_EMAILS</code>{" "}
            environment variable and redeploy.
          </p>
        )}
      </Center>,
    )
  }

  if (state === "error") {
    return chrome(
      <Center>
        <h1 style={h1}>Something went wrong</h1>
        <p style={p}>Failed to load admin data. Please try again.</p>
      </Center>,
    )
  }

  if (loading || state === "loading" || !overview) {
    return chrome(
      <Center>
        <p style={{ ...p, fontFamily: "'IBM Plex Mono', monospace" }}>Loading admin data…</p>
      </Center>,
    )
  }

  // ── Ready: tabbed panel ─────────────────────────────────────────────--
  const tabs: Array<{ key: Tab; label: string; badge?: number }> = [
    { key: "overview", label: "Overview" },
    { key: "subscribers", label: "Users & Subscriptions" },
    { key: "support", label: "Support", badge: overview.support.new || undefined },
  ]

  const maxDaily = Math.max(1, ...overview.analyses.daily.map((d) => d.count))
  const filteredSubs =
    subscribers?.filter((s) => planFilter === "all" || s.plan === planFilter) ?? []

  return chrome(
    <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "28px 24px 64px" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--rule)", marginBottom: "24px" }}>
        {tabs.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              style={{
                appearance: "none",
                border: "none",
                background: "transparent",
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--blue-60)" : "var(--muted)",
                borderBottom: active ? "2px solid var(--blue-60)" : "2px solid transparent",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {t.label}
              {t.badge ? (
                <span
                  style={{
                    background: "var(--orange-50)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    borderRadius: "10px",
                    padding: "1px 7px",
                  }}
                >
                  {t.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* ── Overview tab ─────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "16px",
            }}
          >
            <StatCard label="Total users" value={overview.users.total} sub={`+${overview.users.today} today`} />
            <StatCard label="Analyses" value={overview.analyses.total} sub={`+${overview.analyses.today} today`} />
            <StatCard label="Paid subscribers" value={overview.subscribers.paid} sub={`${overview.subscribers.withCreem} linked to Creem`} />
            <StatCard label="New support" value={overview.support.new} sub="unresolved messages" />
            <StatCard label="Active API keys" value={overview.apiKeys.active} sub={`${overview.apiKeys.total} total`} />
            <StatCard label="Waitlist" value={overview.waitlist.total} sub="feature signups" />
            <StatCard label="Page views" value={overview.pageViews.total} sub={`+${overview.pageViews.today} today`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px" }}>
            {/* Page-view trend */}
            <div style={card}>
              <div style={cardTitle}>Page views · last 14 days</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "160px", marginTop: "16px" }}>
                {overview.pageViews.daily.map((d) => {
                  const maxPv = Math.max(1, ...overview.pageViews.daily.map((x) => x.count))
                  return (
                    <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
                      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                        <div
                          title={`${d.date}: ${d.count} views`}
                          style={{
                            width: "100%",
                            height: `${Math.round((d.count / maxPv) * 100)}%`,
                            minHeight: d.count > 0 ? "3px" : "0",
                            background: d.count > 0 ? "var(--teal-50)" : "var(--rule-2)",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--muted-2)", whiteSpace: "nowrap" }}>
                        {d.date.slice(5).replace("-", "/")}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top pages */}
            <div style={card}>
              <div style={cardTitle}>Top pages</div>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {overview.pageViews.top.length === 0 && (
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>No page views yet.</span>
                )}
                {overview.pageViews.top.map((p) => (
                  <div key={p.path} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "13px" }}>
                    <span style={{ color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.path}</span>
                    <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px" }}>
            {/* Daily trend */}
            <div style={card}>
              <div style={cardTitle}>Analyses · last 14 days</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "160px", marginTop: "16px" }}>
                {overview.analyses.daily.map((d) => (
                  <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                      <div
                        title={`${d.date}: ${d.count}`}
                        style={{
                          width: "100%",
                          height: `${Math.round((d.count / maxDaily) * 100)}%`,
                          minHeight: d.count > 0 ? "3px" : "0",
                          background: d.count > 0 ? "var(--blue-50)" : "var(--rule-2)",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "9px", color: "var(--muted-2)", whiteSpace: "nowrap" }}>
                      {d.date.slice(5).replace("-", "/")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plans + top repos */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={card}>
                <div style={cardTitle}>Plans</div>
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(["free", "pro", "team"] as const).map((pl) => (
                    <div key={pl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Badge text={pl} style={PLAN_STYLE[pl]} />
                      <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink-2)" }}>{overview.plans[pl]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={card}>
                <div style={cardTitle}>Top repos</div>
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {overview.analyses.topRepos.length === 0 && (
                    <span style={{ fontSize: "13px", color: "var(--muted)" }}>No data yet.</span>
                  )}
                  {overview.analyses.topRepos.map((r) => (
                    <div key={r.name} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "13px" }}>
                      <span style={{ color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                      <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div style={card}>
            <div style={cardTitle}>Recent analyses</div>
            <div style={{ overflowX: "auto", marginTop: "8px" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Repository</th>
                    <th style={th}>User</th>
                    <th style={{ ...th, textAlign: "right" }}>Score</th>
                    <th style={{ ...th, textAlign: "right" }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.analyses.recent.map((r) => (
                    <tr key={r.id}>
                      <td style={{ ...td, maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.repo_name || r.repo_url || "—"}
                      </td>
                      <td style={{ ...td, color: "var(--muted)" }}>{r.email}</td>
                      <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {r.quality_score ?? "—"}
                      </td>
                      <td style={{ ...td, textAlign: "right", color: "var(--muted)", whiteSpace: "nowrap" }}>
                        {formatRelativeTime(r.created_at)}
                      </td>
                    </tr>
                  ))}
                  {overview.analyses.recent.length === 0 && (
                    <tr>
                      <td style={{ ...td, color: "var(--muted)" }} colSpan={4}>
                        No analyses yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Subscribers tab ──────────────────────────────────────────── */}
      {tab === "subscribers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
            <StatCard label="Free" value={subPlanCounts.free} />
            <StatCard label="Pro" value={subPlanCounts.pro} />
            <StatCard label="Team" value={subPlanCounts.team} />
            <StatCard label="Waitlist" value={waitlist.length} />
          </div>

          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={cardTitle}>All users</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["all", "free", "pro", "team"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setPlanFilter(f)}
                    style={{
                      appearance: "none",
                      border: "1px solid var(--rule)",
                      background: planFilter === f ? "var(--accent-light)" : "var(--surface)",
                      color: planFilter === f ? "var(--blue-60)" : "var(--muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      padding: "5px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {subscribers === null ? (
              <p style={{ ...p, marginTop: "12px" }}>Loading…</p>
            ) : (
              <div style={{ overflowX: "auto", marginTop: "8px" }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Email</th>
                      <th style={th}>Plan</th>
                      <th style={{ ...th, textAlign: "right" }}>Analyses</th>
                      <th style={th}>Creem customer</th>
                      <th style={{ ...th, textAlign: "right" }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubs.map((s) => (
                      <tr key={s.id}>
                        <td style={{ ...td, color: "var(--ink)" }}>{s.email || "—"}</td>
                        <td style={td}>
                          <Badge text={s.plan} style={PLAN_STYLE[s.plan] || PLAN_STYLE.free} />
                        </td>
                        <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.total_analyses}</td>
                        <td style={{ ...td, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px" }}>
                          {s.creem_customer_id || "—"}
                        </td>
                        <td style={{ ...td, textAlign: "right", color: "var(--muted)", whiteSpace: "nowrap" }}>{formatDate(s.created_at)}</td>
                      </tr>
                    ))}
                    {filteredSubs.length === 0 && (
                      <tr>
                        <td style={{ ...td, color: "var(--muted)" }} colSpan={5}>
                          No users match this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {waitlist.length > 0 && (
            <div style={card}>
              <div style={cardTitle}>Waitlist · recent signups</div>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {waitlist.slice(0, 20).map((w, i) => (
                  <div key={`${w.email}-${i}`} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "13px" }}>
                    <span style={{ color: "var(--ink-2)" }}>{w.email}</span>
                    <span style={{ color: "var(--muted-2)", whiteSpace: "nowrap" }}>
                      {w.source} · {formatRelativeTime(w.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Support tab ──────────────────────────────────────────────── */}
      {tab === "support" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
            <StatCard label="New" value={supportByStatus.new || 0} />
            <StatCard label="Open" value={supportByStatus.open || 0} />
            <StatCard label="Resolved" value={supportByStatus.resolved || 0} />
            <StatCard label="Closed" value={supportByStatus.closed || 0} />
          </div>

          {support === null ? (
            <div style={card}>
              <p style={p}>Loading…</p>
            </div>
          ) : support.length === 0 ? (
            <div style={card}>
              <p style={p}>No support messages yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {support.map((m) => {
                const expanded = expandedMsg === m.id
                return (
                  <div key={m.id} style={{ ...card, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <Badge text={m.status} style={STATUS_STYLE[m.status] || STATUS_STYLE.new} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}>
                            {m.email || "anonymous"}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--muted-2)" }}>
                            {formatRelativeTime(m.created_at)}
                            {m.page ? ` · ${m.page}` : ""}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "10px 0 0",
                            fontSize: "14px",
                            color: "var(--ink-2)",
                            lineHeight: 1.55,
                            whiteSpace: expanded ? "pre-wrap" : "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setExpandedMsg(expanded ? null : m.id)
                            setReplyError(null)
                            setReplyDone(null)
                          }}
                          title={expanded ? "Click to collapse" : "Click to expand"}
                        >
                          {m.message}
                        </p>
                        {expanded && m.user_agent && (
                          <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--muted-2)", wordBreak: "break-all" }}>
                            {m.locale ? `${m.locale} · ` : ""}
                            {m.user_agent}
                          </div>
                        )}
                        {expanded && m.email && (
                          <div style={{ marginTop: "14px" }}>
                            <textarea
                              value={replyDrafts[m.id] || ""}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))
                              }
                              placeholder={`Reply to ${m.email}…`}
                              rows={3}
                              style={{
                                width: "100%",
                                border: "1px solid var(--rule)",
                                borderRadius: "4px",
                                padding: "10px 12px",
                                fontSize: "13px",
                                fontFamily: "inherit",
                                color: "var(--ink)",
                                background: "var(--surface)",
                                resize: "vertical",
                              }}
                            />
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                              <button
                                onClick={() => sendReply(m.id)}
                                disabled={replying === m.id || !(replyDrafts[m.id] || "").trim()}
                                style={{
                                  appearance: "none",
                                  border: "none",
                                  background: (replyDrafts[m.id] || "").trim() ? "var(--blue-60)" : "var(--rule)",
                                  color: "#fff",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  padding: "8px 16px",
                                  borderRadius: "4px",
                                  cursor: (replyDrafts[m.id] || "").trim() ? "pointer" : "default",
                                }}
                              >
                                {replying === m.id ? "Sending…" : "Send reply"}
                              </button>
                              {replyDone === m.id && (
                                <span style={{ fontSize: "12px", color: "var(--green-50)" }}>Sent — marked resolved</span>
                              )}
                              {replyError && replying === null && (
                                <span style={{ fontSize: "12px", color: "var(--red-50)" }}>{replyError}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <label style={{ fontSize: "12px", color: "var(--muted)" }}>Status</label>
                        <select
                          value={m.status}
                          disabled={savingStatus === m.id}
                          onChange={(e) => changeSupportStatus(m.id, e.target.value)}
                          style={{
                            appearance: "none",
                            border: "1px solid var(--rule)",
                            background: "var(--surface)",
                            color: "var(--ink)",
                            fontSize: "13px",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          {["new", "open", "resolved", "closed"].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>,
  )
}

// ── Shared style tokens ────────────────────────────────────────────────
const h1: React.CSSProperties = { fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: "28px", color: "var(--ink)", margin: "0 0 12px" }
const p: React.CSSProperties = { fontSize: "14px", color: "var(--muted)", lineHeight: 1.6, margin: 0 }
const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--rule)", padding: "20px 22px" }
const cardTitle: React.CSSProperties = { fontSize: "13px", fontWeight: 600, color: "var(--ink)", letterSpacing: "0.02em" }
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "13px" }
const th: React.CSSProperties = { textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 12px", borderBottom: "1px solid var(--rule)" }
const td: React.CSSProperties = { padding: "10px 12px", borderBottom: "1px solid var(--rule-2)", verticalAlign: "middle" }

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ maxWidth: "440px", textAlign: "center" }}>{children}</div>
    </div>
  )
}
