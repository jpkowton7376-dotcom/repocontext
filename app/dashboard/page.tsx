"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

/** Recent analysis row used by the dashboard. */
interface RecentAnalysis {
  id: string
  repo_name: string | null
  repo_url: string | null
  quality_score: number | null
  created_at: string
}

/** Render a timestamp as a short relative time, e.g. "3h ago". */
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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>("free")
  const [activating, setActivating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analysesToday, setAnalysesToday] = useState<number>(0)
  const [totalAnalyses, setTotalAnalyses] = useState<number>(0)
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([])
  const [openingPortal, setOpeningPortal] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)
  const router = useRouter()

  // Supabase 未配置时显示提示
  if (!isSupabaseConfigured()) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top blue bar */}
        <div style={{ height: "4px", background: "var(--blue-60)" }} />

        <nav style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          height: "64px",
          borderBottom: "1px solid var(--rule)",
          background: "white",
        }}>
          <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}>
            <div style={{ width: "36px", height: "36px", position: "relative" }}>
              <Image
                src="/logo.png"
                alt="RepoContext"
                fill
                sizes="36px"
                style={{ objectFit: "contain", backgroundColor: "transparent" }}
                priority
                quality={95}
              />
            </div>
            <span style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}>
              RepoContext
            </span>
          </Link>
        </nav>

        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 48px",
          background: "var(--bg-warm)",
        }}>
          <div style={{
            maxWidth: "480px",
            width: "100%",
            background: "white",
            border: "1px solid var(--rule)",
            padding: "48px",
          }}>
            <div style={{
              fontSize: "48px",
              marginBottom: "24px",
            }}>🔧</div>
            <h1 style={{
              fontFamily: "'IBM Plex Serif', Georgia, serif",
              fontSize: "32px",
              fontWeight: 300,
              lineHeight: 1.2,
              color: "var(--ink)",
              margin: "0 0 16px 0",
            }}>
              Dashboard not available
            </h1>
            <p style={{
              fontSize: "15px",
              color: "var(--muted)",
              lineHeight: 1.6,
              marginBottom: "32px",
            }}>
              The dashboard requires Supabase to be configured.
              You can still use the analyzer from the homepage.
            </p>
            <div style={{
              padding: "24px",
              background: "var(--bg-cool)",
              border: "1px solid var(--rule)",
              marginBottom: "32px",
            }}>
              <p style={{
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "12px",
                fontWeight: 500,
              }}>
                <strong style={{ color: "var(--ink)" }}>To enable the dashboard, add these to your .env.local:</strong>
              </p>
              <pre style={{
                fontSize: "12px",
                fontFamily: "'IBM Plex Mono', monospace",
                color: "var(--blue-70)",
                background: "white",
                padding: "16px",
                border: "1px solid var(--rule-2)",
                margin: 0,
                overflowX: "auto",
                lineHeight: 1.6,
              }}>
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...`}
              </pre>
            </div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 24px",
                background: "var(--blue-60)",
                color: "white",
                fontWeight: 500,
                fontSize: "15px",
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  useEffect(() => {
    const fetchPlan = async (userId: string) => {
      const { data: profile } = await supabase!
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .maybeSingle()
      return (profile?.plan as string) || "free"
    }

    const checkUser = async () => {
      // 1. 先从 cookie 里读 session（不发起网络请求，最稳定）。
      //    之前的实现用 getUser() 会在 token 过期/网络抖动时返回 null，
      //    把已经登录的用户踢回 /login。
      const {
        data: { session },
      } = await supabase!.auth.getSession()
      if (!session?.user) {
        router.push("/login")
        setLoading(false)
        return
      }
      setUser(session.user)

      let currentPlan = await fetchPlan(session.user.id)
      setPlan(currentPlan)

      // Load usage stats and the recent analyses list in parallel.
      // RLS on `analyses` limits results to the signed-in user, so we can
      // safely use the regular user client (no service role needed).
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const [todayRes, totalRes, recentRes] = await Promise.all([
        supabase!
          .from("analyses")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .gte("created_at", todayStart.toISOString()),
        supabase!
          .from("analyses")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id),
        supabase!
          .from("analyses")
          .select("id, repo_name, repo_url, quality_score, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ])
      setAnalysesToday(todayRes.count ?? 0)
      setTotalAnalyses(totalRes.count ?? 0)
      setRecentAnalyses((recentRes.data ?? []) as RecentAnalysis[])

      setLoading(false)

      // 2. 后台静默校验 token；只有完全无法刷新时才强制退出。
      const { data: { user: validated } } = await supabase!.auth.getUser()
      if (validated) setUser(validated)

      // After checkout the Creem webhook can take a few seconds to arrive.
      // Poll briefly so the user sees Pro without reloading the page.
      const justPaid =
        typeof window !== "undefined" &&
        window.location.search.includes("success=true")

      if (justPaid && currentPlan === "free") {
        setActivating(true)
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 3000))
          currentPlan = await fetchPlan(session.user.id)
          if (currentPlan !== "free") {
            setPlan(currentPlan)
            break
          }
        }
        setActivating(false)
      }
    }
    checkUser()

    const { data: authListener } = supabase!.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        // 仅在显式登出时跳转 /login。
        // 不要在 INITIAL_SESSION / TOKEN_REFRESHED 出现 null session 时跳转，
        // 那样会把已经登录的用户踢出去。
        if (!session?.user) {
          setUser(null)
          if (_event === "SIGNED_OUT") {
            router.push("/login")
          }
        } else {
          setUser(session.user)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await supabase!.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Open the Creem-hosted Customer Portal so the signed-in user can
  // cancel, change payment method or download invoices on their own.
  // Without this, paying users have no way to stop the subscription and
  // would have to file a chargeback — which is the single most common
  // way a small SaaS loses its payment-processing account.
  const handleManageSubscription = async () => {
    setPortalError(null)
    setOpeningPortal(true)
    try {
      const res = await fetch("/api/creem/portal", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.url) {
        setPortalError(
          data?.error ||
            "Could not open the billing portal. Please try again in a moment.",
        )
        return
      }
      window.location.href = data.url
    } catch (err: any) {
      setPortalError(
        err?.message || "Could not open the billing portal.",
      )
    } finally {
      setOpeningPortal(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-warm)",
      }}>
        <div style={{
          fontSize: "14px",
          color: "var(--muted)",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.05em",
        }}>
          LOADING...
        </div>
      </div>
    )
  }

  // The one-time product was previously labeled "Team"; treat it as Pro.
  const planLabel =
    plan === "pro" || plan === "team" ? "Pro" : "Free"

  const stats = [
    {
      label: "Plan",
      value: planLabel,
      sub: plan === "free" ? "Monthly quota applies" : "Unlimited analyses",
      link: plan === "free" ? "/pricing" : null,
      linkText: plan === "free" ? "Upgrade →" : null,
    },
    {
      label: "Analyses today",
      value: String(analysesToday),
      sub: "since midnight (UTC)",
      link: null,
      linkText: null,
    },
    {
      label: "Total analyses",
      value: String(totalAnalyses),
      sub: "All time",
      link: null,
      linkText: null,
    },
  ]

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-warm)" }}>
      {/* Top blue bar */}
      <div style={{ height: "4px", background: "var(--blue-60)" }} />

      {/* Navigation */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: "64px",
        borderBottom: "1px solid var(--rule)",
        background: "white",
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
        }}>
          <div style={{ width: "36px", height: "36px", position: "relative" }}>
            <Image
              src="/logo.png"
              alt="RepoContext"
              fill
              sizes="36px"
              style={{ objectFit: "contain", backgroundColor: "transparent" }}
              priority
              quality={95}
            />
          </div>
          <span style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}>
            RepoContext
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            href="/"
            style={{
              fontSize: "13px",
              color: "var(--ink-2)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Home
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--blue-60)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}>
              {user?.email?.charAt(0) || "U"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--ink)",
              }}>
                {user?.email?.split("@")[0]}
              </span>
              <span style={{
                fontSize: "11px",
                color: "var(--muted)",
              }}>
                {planLabel} plan
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              fontSize: "13px",
              color: "var(--ink-2)",
              background: "none",
              border: "1px solid var(--rule)",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: 500,
              letterSpacing: "0.02em",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-cool)"
              e.currentTarget.style.borderColor = "var(--muted-2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none"
              e.currentTarget.style.borderColor = "var(--rule)"
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <section style={{
        padding: "64px 48px 48px",
        background: "linear-gradient(180deg, #e8f0ff 0%, var(--bg-warm) 100%)",
        borderBottom: "1px solid var(--rule)",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--blue-70)",
            marginBottom: "16px",
          }}>
            Dashboard
          </div>
          <h1 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "44px",
            fontWeight: 300,
            lineHeight: "1.15",
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            margin: "0 0 12px 0",
          }}>
            Welcome back.
          </h1>
          <p style={{
            fontSize: "16px",
            color: "var(--muted)",
            lineHeight: 1.6,
            maxWidth: "560px",
            margin: 0,
          }}>
            Here&apos;s an overview of your account and recent activity.
          </p>
        </div>
      </section>

      {/* Stats cards */}
      <section style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "48px",
        width: "100%",
      }}>
        {activating && (
          <div style={{
            background: "var(--blue-10, #EEF2FF)",
            border: "1px solid var(--blue-30, #93A5FF)",
            padding: "16px 20px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "var(--blue-60, #2B3BE0)",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.02em",
          }}>
            Payment received — activating your Pro plan…
          </div>
        )}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1px",
          background: "var(--rule)",
          border: "1px solid var(--rule)",
          marginBottom: "48px",
        }}>
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                background: "white",
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "16px",
              }}>
                {stat.label}
              </div>
              <div style={{
                fontFamily: "'IBM Plex Serif', Georgia, serif",
                fontSize: "40px",
                fontWeight: 300,
                lineHeight: 1,
                color: "var(--ink)",
                marginBottom: "8px",
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "16px",
              }}>
                {stat.sub}
              </div>
              {stat.link ? (
                <Link
                  href={stat.link}
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--blue-70)",
                    textDecoration: "none",
                    marginTop: "auto",
                    letterSpacing: "0.02em",
                  }}
                >
                  {stat.linkText}
                </Link>
              ) : stat.linkText ? (
                <div style={{
                  fontSize: "12px",
                  color: "var(--muted-2)",
                  marginTop: "auto",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  {stat.linkText}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Two columns: Quick actions + History */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
        }}>
          {/* Quick actions */}
          <div>
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "20px",
            }}>
              Quick actions
            </div>
            <div style={{
              background: "white",
              border: "1px solid var(--rule)",
            }}>
              <Link
                href="/"
                style={{
                  display: "block",
                  padding: "24px 28px",
                  borderBottom: "1px solid var(--rule-2)",
                  textDecoration: "none",
                  color: "var(--ink)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-cool)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white"
                }}
              >
                <div style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}>
                  Analyze a repository →
                </div>
                <div style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                }}>
                  Generate AGENTS.md for any GitHub repository
                </div>
              </Link>

              <Link
                href="/pricing"
                style={{
                  display: plan === "free" ? "block" : "none",
                  padding: "24px 28px",
                  textDecoration: "none",
                  color: "var(--ink)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-cool)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white"
                }}
              >
                <div style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}>
                  Upgrade to Pro →
                </div>
                <div style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                }}>
                  Unlimited analyses, private repos, multi-format export
                </div>
              </Link>

              {plan !== "free" && (
                <button
                  type="button"
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "24px 28px",
                    border: "none",
                    background: "transparent",
                    cursor: openingPortal ? "wait" : "pointer",
                    color: "var(--ink)",
                    fontFamily: "inherit",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!openingPortal) e.currentTarget.style.background = "var(--bg-cool)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  <div style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    marginBottom: "4px",
                  }}>
                    {openingPortal ? "Opening billing portal…" : "Manage subscription →"}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                  }}>
                    Cancel, update payment method or download invoices
                  </div>
                  {portalError && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#dc2626",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}>
                      {portalError}
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "20px",
            }}>
              Recent analyses
            </div>
            {recentAnalyses.length === 0 ? (
              <div style={{
                background: "white",
                border: "1px solid var(--rule)",
                padding: "48px 32px",
                textAlign: "center",
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 20px",
                  background: "var(--bg-cool)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}>
                  📂
                </div>
                <div style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "var(--ink)",
                  marginBottom: "8px",
                }}>
                  No analyses yet
                </div>
                <div style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  marginBottom: "20px",
                }}>
                  Your analysis history will appear here.
                </div>
                <Link
                  href="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "10px 20px",
                    background: "var(--blue-60)",
                    color: "white",
                    fontWeight: 500,
                    fontSize: "14px",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                  }}
                >
                  Analyze your first repo
                </Link>
              </div>
            ) : (
              <div style={{
                background: "white",
                border: "1px solid var(--rule)",
              }}>
                {recentAnalyses.map((a, i) => (
                  <div
                    key={a.id}
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      borderBottom: i < recentAnalyses.length - 1 ? "1px solid var(--rule-2)" : "none",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "var(--ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {a.repo_name || "Unknown repository"}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        fontFamily: "'IBM Plex Mono', monospace",
                        marginTop: "2px",
                      }}>
                        {formatRelativeTime(a.created_at)}
                      </div>
                    </div>
                    {a.quality_score !== null && (
                      <div style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: a.quality_score >= 80 ? "#1f9d55" : a.quality_score >= 60 ? "#d97706" : "#dc2626",
                        minWidth: "32px",
                        textAlign: "right",
                      }}>
                        {a.quality_score}
                      </div>
                    )}
                    {a.repo_url && (
                      <a
                        href={a.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "var(--blue-70)",
                          textDecoration: "none",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account info */}
        <div style={{ marginTop: "48px" }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "20px",
          }}>
            Account
          </div>
          <div style={{
            background: "white",
            border: "1px solid var(--rule)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 28px",
              borderBottom: "1px solid var(--rule-2)",
            }}>
              <div>
                <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "4px" }}>
                  Email
                </div>
                <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)" }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 28px",
              borderBottom: "1px solid var(--rule-2)",
            }}>
              <div>
                <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "4px" }}>
                  User ID
                </div>
                <div style={{
                  fontSize: "13px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: "var(--muted)",
                }}>
                  {user?.id}
                </div>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 28px",
            }}>
              <div>
                <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "4px" }}>
                  Created
                </div>
                <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)" }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: "auto",
        background: "#111",
        color: "#949494",
        padding: "48px",
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "28px", height: "28px", position: "relative", opacity: 0.9 }}>
              <Image
                src="/logo.png"
                alt="RepoContext"
                fill
                sizes="28px"
                style={{ objectFit: "contain", backgroundColor: "transparent" }}
                quality={95}
              />
            </div>
            <span style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "white",
            }}>
              RepoContext
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#6f6f6f" }}>
            © 2026 RepoContext. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
