"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MaskedIllustration } from "@/components/MaskedIllustration"
import { GlowLink } from "@/components/GlowLink"
import { SiteNav } from "@/components/SiteNav"
import { ForgeProjectCard } from "@/components/ForgeProjectCard"
import { PROJECTS } from "@/lib/forge-data"
import { JsonLd } from "@/components/JsonLd"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { saveRecent } from "@/lib/recent-analyses"
import { SITE_URL } from "@/lib/site-url"
import { useTranslation } from "@/components/LanguageProvider"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

/** Small GitHub mark used in connect buttons. */
function GitHubMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  )
}

export default function HomePage() {
  const { t, dict, locale } = useTranslation()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>("free")
  const [analyzeHover, setAnalyzeHover] = useState(false)
  const [waitlistHover, setWaitlistHover] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState("")
  const [waitlistState, setWaitlistState] = useState<
    "idle" | "sending" | "done" | "error"
  >("idle")
  const [userToken, setUserToken] = useState<string | null>(null)
  const [authRequired, setAuthRequired] = useState(false)
  const [githubToken, setGithubToken] = useState<string | null>(null)
  const [githubUser, setGithubUser] = useState<string | null>(null)
  // Long-lived GitHub PAT fallback (persisted in the browser) so private-repo
  // analysis isn't limited by the 8h OAuth token expiry from Supabase.
  const [patToken, setPatToken] = useState<string | null>(null)
  const [showPatInput, setShowPatInput] = useState(false)
  const [patInput, setPatInput] = useState("")
  const [connectingGithub, setConnectingGithub] = useState(false)
  const [githubError, setGithubError] = useState<string | null>(null)
  const [trial, setTrial] = useState<{
    freeRemaining: number
    freeLimit: number
    proRemaining: number
    proLimit: number
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const loadPlan = async (userId: string) => {
      try {
        const { data: profile } = await supabase!
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .maybeSingle()
        setPlan(profile?.plan || "free")
      } catch {
        setPlan("free")
      }
    }

    async function loadTrial() {
      try {
        const t = await fetch(`/api/trial`).then((r) => r.json()).catch(() => null)
        if (t) setTrial(t)
      } catch {
        // 忽略
      }
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase!.auth.getSession()
      setUser(session?.user || null)
      setUserToken(session?.access_token || null)
      setGithubToken(session?.provider_token || null)
      const ghMeta = session?.user?.user_metadata
      setGithubUser(ghMeta?.user_name || ghMeta?.preferred_username || ghMeta?.name || null)
      loadTrial()
      if (session?.user) await loadPlan(session.user.id)
    }
    checkUser()

    const { data: authListener } = supabase!.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        // Only treat explicit SIGNED_OUT as a sign-out. A null session in
        // INITIAL_SESSION / TOKEN_REFRESHED may be transient and must not
        // clear the user state used by the analyzer form.
        if (session?.user) {
          setUser(session.user)
          setUserToken(session.access_token || null)
          setGithubToken(session.provider_token || null)
          const m = session.user.user_metadata
          setGithubUser(m?.user_name || m?.preferred_username || m?.name || null)
          loadPlan(session.user.id)
        } else if (_event === "SIGNED_OUT") {
          setUser(null)
          setPlan("free")
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Restore a previously saved GitHub PAT (long-lived private-repo access).
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("repocontext_pat") : null
    if (saved) setPatToken(saved)
  }, [])

  const savePat = () => {
    const v = patInput.trim()
    if (!v) return
    setPatToken(v)
    try { localStorage.setItem("repocontext_pat", v) } catch {}
    setPatInput("")
    setShowPatInput(false)
    setGithubError(null)
  }
  const clearPat = () => {
    setPatToken(null)
    try { localStorage.removeItem("repocontext_pat") } catch {}
    setShowPatInput(false)
  }

  /**
   * Connect (or sign in with) GitHub so private repositories can be read.
   * If a user is already signed in we link the GitHub identity to their
   * account (Supabase linkIdentity — keeps the session, just adds the
   * provider_token); otherwise we start a fresh GitHub OAuth sign-in.
   * Either way GitHub bounces back to /auth/callback, which lands on /.
   */
  const connectGitHub = async () => {
    if (!supabase || connectingGithub) return
    setGithubError(null)
    setConnectingGithub(true)
    const opts = {
      redirectTo: `${window.location.origin}/auth/callback?next=/`,
      scopes: "repo read:org user:email",
    }
    try {
      if (user) {
        await supabase.auth.linkIdentity({ provider: "github", options: opts })
      } else {
        await supabase.auth.signInWithOAuth({ provider: "github", options: opts })
      }
    } catch (err: any) {
      setConnectingGithub(false)
      // The GitHub provider is likely disabled in Supabase (common pre-launch
      // state). Rather than dead-end, reveal the PAT input so private-repo
      // access still works — PAT is the reliable path regardless of OAuth.
      const msg = String(err?.message || err || "")
      if (/provider|oauth|not enabled|unsupported/i.test(msg)) {
        setGithubError(
          "GitHub sign-in isn't enabled on this site yet. Paste a personal access token (PAT) below instead — it works for private repos right now."
        )
      } else {
        setGithubError("Couldn't connect to GitHub. You can paste a token (PAT) below instead.")
      }
      setShowPatInput(true)
    }
  }

  const handleSubmit = async (e?: React.FormEvent, overrideUrl?: string) => {
    e?.preventDefault()
    const target = (overrideUrl || url).trim()
    if (!target) return
    setUrl(target)
    setLoading(true)
    setProgress(0)
    setStage("Starting analysis…")
    setError("")
    setAuthRequired(false)

    // The endpoint streams real stage progress as Server-Sent Events
    // (fetch → scan → generate → enhance → score). We read the stream and
    // reflect each event's stage label + cumulative percentage directly.
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: target,
          plan,
          userToken,
          // A saved PAT (long-lived) takes priority over the 8h OAuth token.
          githubToken: patToken || githubToken,
        }),
      })

      // Non-streaming error (rate limit / missing url / trial exhausted / bad auth)
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        if (data.code === "AUTH_REQUIRED") setAuthRequired(true)
        throw new Error(data.error || "Analysis failed")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let finalResult: any = null
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() || ""
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith("data:")) continue
          const json = line.slice(5).trim()
          if (!json) continue
          const msg = JSON.parse(json)
          if (msg.type === "progress") {
            setProgress(msg.progress)
            if (msg.stage) setStage(msg.stage)
          } else if (msg.type === "error") {
            if (msg.code === "AUTH_REQUIRED") setAuthRequired(true)
            throw new Error(msg.error || "Analysis failed")
          } else if (msg.type === "done") {
            finalResult = msg.result
            setProgress(msg.progress ?? 100)
          }
        }
      }

      if (!finalResult) throw new Error("No result received")

      // Persist full payload (including formats / audit / evidence) for the result page
      // sessionStorage covers the current tab; localStorage keeps the result
      // available after a refresh or in another tab, and feeds the "recent
      // analyses" list for visitors who aren't signed in.
      try {
        sessionStorage.setItem("repoResult", JSON.stringify(finalResult))
      } catch {
        // sessionStorage may be full or unavailable; the result page will redirect home
      }
      saveRecent(target, finalResult)
      setProgress(100)
      router.push(`/result?repo=${encodeURIComponent(target)}`)
    } catch (err: any) {
      setProgress(0)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Waitlist signup. Previously this just opened a mailto: link, which
   * meant we never actually learned who wanted early access.
   */
  async function joinWaitlist() {
    const email = waitlistEmail.trim()
    if (!email || waitlistState === "sending") return

    setWaitlistState("sending")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-roadmap", locale }),
      })
      if (!res.ok) {
        setWaitlistState("error")
        return
      }
      setWaitlistEmail("")
      setWaitlistState("done")
    } catch {
      setWaitlistState("error")
    }
  }

  function RoadmapCard({ item }: { item: { title: string; desc: string; eta: string; available?: boolean; href?: string } }) {
    const [hovered, setHovered] = useState(false)
    const cardStyle: React.CSSProperties = {
      background: item.available ? "rgba(31,157,85,0.06)" : "rgba(255,255,255,0.5)",
      padding: "32px 24px",
      border: item.available ? "1px solid rgba(31,157,85,0.35)" : "1px dashed var(--rule)",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      transform: hovered ? "scale(1.05)" : "scale(1)",
      textDecoration: "none",
      color: "inherit",
    }
    const card = (
      <>
        <span style={{
          display: "inline-block",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: item.available ? "#1f9d55" : "var(--blue-60)",
          background: item.available ? "rgba(31,157,85,0.12)" : "var(--blue-10)",
          padding: "4px 10px",
          marginBottom: "20px",
          alignSelf: "flex-start",
        }}>
          {item.available ? "LIVE" : item.eta}
        </span>
        <h3 style={{
          fontSize: "16px",
          fontWeight: 600,
          margin: "0 0 10px 0",
          lineHeight: 1.4,
          color: "var(--ink)",
        }}>
          {item.title}
        </h3>
        <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          {item.desc}
        </p>
        <div style={{
          marginTop: "auto",
          paddingTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          color: "var(--muted-2)",
          fontWeight: 500,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {item.available ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </>
            )}
          </svg>
          {item.available ? "Available now" : t("home.roadmapComingSoon")}
        </div>
      </>
    )
    if (item.href) {
      return (
        <Link href={item.href} style={cardStyle}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          {card}
        </Link>
      )
    }
    return (
      <div style={cardStyle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {card}
      </div>
    )
  }

  const topPosts = [...PROJECTS].sort((a, b) => b.stars - a.stars).slice(0, 3)

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "RepoContext",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web",
          description:
            "Generate accurate AGENTS.md, CLAUDE.md, .cursorrules and GitHub Copilot instructions for any GitHub repository in under a minute.",
          url: SITE_URL,
          offers: [
            {
              "@type": "Offer",
              name: "Free",
              price: "0",
              priceCurrency: "USD",
              description: "4 free analyses per month",
            },
            {
              "@type": "Offer",
              name: "Pro Monthly",
              price: "19",
              priceCurrency: "USD",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "19",
                priceCurrency: "USD",
                referenceQuantity: { "@type": "Duration", value: 1, unitCode: "MON" },
              },
            },
            {
              "@type": "Offer",
              name: "Pro Yearly",
              price: "149",
              priceCurrency: "USD",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "149",
                priceCurrency: "USD",
                referenceQuantity: { "@type": "Duration", value: 1, unitCode: "ANN" },
              },
            },
            {
              "@type": "Offer",
              name: "Lifetime",
              price: "299",
              priceCurrency: "USD",
              description: "One-time payment",
            },
          ],
          featureList: [
            "AGENTS.md generation",
            "CLAUDE.md generation",
            ".cursorrules generation",
            "GitHub Copilot instructions",
            "Repository quality scoring",
            "Support for 20+ tech stacks",
            "Public and private repositories (Pro+)",
            "AI-enhanced LLM analysis (Pro+)",
          ],
        }}
      />
      <style>{`
        @keyframes breathe-glow {
          0%, 100% {
            text-shadow: 0 0 8px rgba(254, 127, 15, 0.35), 0 0 18px rgba(254, 127, 15, 0.2);
          }
          50% {
            text-shadow: 0 0 18px rgba(254, 127, 15, 0.7), 0 0 40px rgba(254, 127, 15, 0.45), 0 0 60px rgba(254, 127, 15, 0.25);
          }
        }
      `}</style>
      {/* Top announcement bar */}
      <div style={{
        background: "#001085",
        color: "white",
        padding: "10px 24px",
        fontSize: "13px",
        textAlign: "center",
        fontWeight: 500,
      }}>
        {t("home.announcement")}
        <GlowLink href="/changelog" style={{ marginLeft: "12px", textDecoration: "underline", cursor: "pointer" }}>
          {t("home.announcementCta")}
        </GlowLink>
      </div>

      {/* Navigation */}
      <SiteNav variant="dark" />

      {/* Hero Section — IBM style */}
      <section className="rc-hero-section" style={{
        padding: "80px 48px",
        background: "#000000",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid pattern — 1px lines, 48px spacing preserved; softened to a subtle background that does not compete with foreground content */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(92, 154, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(92, 154, 255, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }} />

        <div className="rc-hero-grid" style={{
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "center",
        }}>
          {/* Left: Copy */}
          <div>
            <div style={{
              display: "inline-block",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ffffff",
              marginBottom: "24px",
              padding: "6px 14px",
              background: "rgba(64, 128, 255, 0.25)",
              border: "1px solid rgba(92, 154, 255, 0.55)",
            }}>
              {t("home.heroEyebrow")}
            </div>
            <h1 style={{
              fontFamily: "'IBM Plex Serif', Georgia, serif",
              fontSize: "56px",
              fontWeight: 300,
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
              color: "#ffffff",
              margin: "0 0 24px 0",
            }}>
              {dict.home.title}
              <br />
              {dict.home.subtitle.split("AI-ready").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span style={{ color: "#FE7F0F", fontWeight: 500, animation: "breathe-glow 2.6s ease-in-out infinite" }}>
                      AI-ready
                    </span>
                  )}
                </span>
              ))}
            </h1>
            <p className="rc-hero-desc" style={{
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#c8d0dc",
              marginBottom: "36px",
              maxWidth: "520px",
            }}>
              {dict.home.description}
            </p>

            {/* Search bar */}
            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
              <div style={{
                display: "flex",
                gap: "0",
                maxWidth: "560px",
                boxShadow: "0 4px 24px rgba(64, 128, 255, 0.2)",
              }}>
                <div style={{
                  flex: 1,
                  position: "relative",
                  background: "#0e1420",
                  border: "2px solid rgba(92, 154, 255, 0.35)",
                  overflow: "hidden",
                  transition: "border-color 0.15s ease",
                }}>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t("home.inputPlaceholder")}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "18px 20px",
                      paddingRight: loading ? "76px" : "20px",
                      fontSize: "15px",
                      border: "none",
                      background: "transparent",
                      color: loading ? "#c9d4e6" : "#ffffff",
                      fontFamily: "'IBM Plex Mono', monospace",
                      outline: "none",
                      position: "relative",
                      zIndex: 2,
                    }}
                    onFocus={(e) => {
                      const p = e.currentTarget.parentElement
                      if (p) p.style.borderColor = "#5c9aff"
                      e.target.placeholder = ""
                    }}
                    onBlur={(e) => {
                      const p = e.currentTarget.parentElement
                      if (p) p.style.borderColor = "rgba(92, 154, 255, 0.35)"
                      if (!url) e.target.placeholder = t("home.inputPlaceholder")
                    }}
                  />
                  {loading && (
                    <>
                      <div className="charge-fill" style={{ width: `${progress}%` }} />
                      <div className="charge-badge">{progress}%</div>
                    </>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setAnalyzeHover(true)}
                  onMouseLeave={() => setAnalyzeHover(false)}
                  style={{
                    padding: "18px 32px",
                    background: analyzeHover ? "#4a82ff" : "#2f6bff",
                    color: "white",
                    border: "none",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: loading ? "default" : "pointer",
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                    opacity: loading ? 0.85 : 1,
                    boxShadow:
                      analyzeHover && !loading
                        ? "0 0 32px rgba(47, 107, 255, 0.6), 0 8px 24px rgba(47, 107, 255, 0.4)"
                        : "0 4px 16px rgba(47, 107, 255, 0.25)",
                    transform: analyzeHover && !loading ? "translateY(-2px)" : "translateY(0)",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="analyze-spinner" />
                      {t("home.analyzing")}
                    </span>
                  ) : t("home.analyze")}
                </button>
              </div>

              {loading && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#8b95a8",
                    marginTop: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span className="rc-dot" />
                  {stage || t("home.loadingHint")}
                </p>
              )}

              {error && (
                <p style={{ color: "#ff6b7a", fontSize: "14px", marginTop: "12px" }}>
                  {error}
                  {authRequired && (
                    <>
                      {" "}
                      <Link href="/signup" style={{ color: "#5c9aff", textDecoration: "underline" }}>
                        Register for free →
                      </Link>
                    </>
                  )}
                </p>
              )}
            </form>

            {/* GitHub connection — unlocks private-repository analysis.
                The PAT fallback gives long-lived access without the 8h OAuth limit. */}
            <div style={{ marginTop: "16px" }}>
              {patToken ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "13px", color: "#9fe6b0" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Using a pasted GitHub token (long-lived) — private repositories enabled
                  <button
                    type="button"
                    onClick={clearPat}
                    style={{ background: "none", border: "none", color: "#5c9aff", cursor: "pointer", fontSize: "13px", padding: 0, textDecoration: "underline" }}
                  >
                    Remove
                  </button>
                </div>
              ) : githubToken ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "13px", color: "#9fe6b0" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  {githubUser ? `Connected to GitHub as @${githubUser}` : "Connected to GitHub"} — private repositories enabled
                </div>
              ) : user ? (
                <>
                  <button
                    type="button"
                    onClick={connectGitHub}
                    disabled={connectingGithub}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#ffffff",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(92,154,255,0.4)",
                      borderRadius: "8px",
                      cursor: connectingGithub ? "default" : "pointer",
                    }}
                  >
                    <GitHubMark />
                    {connectingGithub ? "Connecting…" : "Connect GitHub to analyze private repos"}
                  </button>
                  {githubError && (
                    <div style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      lineHeight: 1.6,
                      color: "#ffb4b4",
                      background: "rgba(255,90,90,0.08)",
                      border: "1px solid rgba(255,90,90,0.3)",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      maxWidth: "560px",
                    }}>
                      {githubError}
                    </div>
                  )}
                </>
              ) : (
                <span style={{ fontSize: "13px", color: "#8b95a8" }}>
                  <Link href="/login" style={{ color: "#5c9aff", textDecoration: "underline" }}>
                    Sign in with GitHub
                  </Link>{" "}
                  to analyze private repositories
                </span>
              )}

              {!patToken && (
                <div style={{ marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowPatInput((v) => !v)}
                    style={{ background: "none", border: "none", color: "#5c9aff", cursor: "pointer", fontSize: "13px", padding: 0, textDecoration: "underline" }}
                  >
                    {showPatInput ? "Hide token input" : "Or paste a GitHub token (PAT) for longer access →"}
                  </button>
                  {showPatInput && (
                    <>
                      <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", maxWidth: "560px" }}>
                        <input
                          type="password"
                          value={patInput}
                          onChange={(e) => setPatInput(e.target.value)}
                          placeholder="ghp_… or github_pat_… (needs repo scope)"
                          style={{
                            flex: 1,
                            minWidth: "240px",
                            padding: "10px 12px",
                            fontSize: "13px",
                            fontFamily: "'IBM Plex Mono', monospace",
                            background: "#0e1420",
                            border: "1px solid rgba(92,154,255,0.4)",
                            borderRadius: "8px",
                            color: "#fff",
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={savePat}
                          disabled={!patInput.trim()}
                          style={{
                            padding: "10px 16px",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#fff",
                            background: patInput.trim() ? "#2f6bff" : "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(92,154,255,0.4)",
                            borderRadius: "8px",
                            cursor: patInput.trim() ? "pointer" : "default",
                          }}
                        >
                          Save token
                        </button>
                      </div>
                      <div style={{ fontSize: "12px", color: "#8b95a8", marginTop: "8px", maxWidth: "540px", lineHeight: "1.6" }}>
                        A token with the <code style={{ color: "#c9d4e6" }}>repo</code> scope reads private repos and lasts up to 1 year (or no expiry). Stored only in your browser.
                        <div style={{ marginTop: "8px", color: "#aeb8c9" }}>
                          <strong style={{ color: "#c9d4e6" }}>How to create one:</strong>
                          <ol style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                            <li>GitHub → <strong>Settings</strong> → <strong>Developer settings</strong> → <strong>Personal access tokens</strong></li>
                            <li>Pick <strong>Fine-grained</strong> (recommended) or <strong>Tokens (classic)</strong></li>
                            <li>Grant the target repo(s) at least <strong>Read</strong> on Contents — classic: just check <code style={{ color: "#c9d4e6" }}>repo</code></li>
                            <li>Set expiry to <strong>1 year</strong> or <strong>No expiration</strong>, then <strong>Generate</strong> and paste it here</li>
                          </ol>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {trial && plan !== 'pro' && plan !== 'team' && (
              <p style={{ fontSize: '13px', marginTop: '12px', color: trial.proRemaining > 0 ? '#8b95a8' : (trial.freeRemaining > 0 ? '#8b95a8' : '#ffb454') }}>
                {trial.proRemaining > 0
                  ? t("home.proTrialRemaining", { remaining: trial.proRemaining, limit: trial.proLimit })
                  : trial.freeRemaining > 0
                    ? t("home.freeRemaining", { remaining: trial.freeRemaining, limit: trial.freeLimit })
                    : t("home.trialExhausted", { limit: trial.proLimit })}
                {trial.proRemaining === 0 && (
                  <a href='/pricing' style={{ color: '#5c9aff', marginLeft: '8px', textDecoration: 'underline' }}>{t("home.subscribe")}</a>
                )}
              </p>
            )}

            <p style={{ fontSize: "13px", color: "#8b95a8" }}>
              {t("home.examplesTry")}{" "}
              {dict.home.examples?.map((ex, i) => (
                <span key={ex}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8b95a8", fontWeight: 300 }}>
                    {ex}
                  </span>
                  {i < (dict.home.examples?.length ?? 0) - 1 && <span>{" · "}</span>}
                </span>
              ))}
            </p>
            <p style={{ fontSize: "17px", color: "#8b95a8", marginTop: "8px" }}>
              <Link href="/get-repo-link" style={{ color: "#FE7F0F", textDecoration: "underline", cursor: "pointer" }}>
                {t("home.linkHint")}
              </Link>
            </p>
          </div>

          {/* Right: Hero visual */}
          <div className="rc-hero-illu" style={{ position: "relative", height: "600px" }}>
            {/* Floating logo — further enlarged to anchor the hero composition; cards layered above it */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              height: "600px",
              maxWidth: "100%",
              filter: "drop-shadow(0 24px 70px rgba(64, 128, 255, 0.4))",
            }}>
              <Image
                src="/logo-dark.png"
                alt="RepoContext Logo"
                fill
                sizes="(max-width: 768px) 320px, 600px"
                style={{ objectFit: "contain", backgroundColor: "transparent" }}
                quality={100}
                priority
              />
            </div>

            {/* Floating code snippet cards — moved closer to the central logo to wrap around it */}
            <div className="rc-hero-card rc-hero-card-fx" style={{
              position: "absolute",
              top: "60px",
              right: "60px",
              zIndex: 2,
              background: "#ffffff",
              border: "1px solid #c8cfda",
              padding: "20px",
              boxShadow: "0 10px 40px rgba(64, 128, 255, 0.35)",
              width: "240px",
              fontSize: "12px",
            }}>
              <div className="rc-hero-label" style={{ fontSize: "11px", fontWeight: 600, color: "#64707f", marginBottom: "8px", letterSpacing: "0.05em" }}>
                {t("home.detectedFramework")}
              </div>
              <div className="rc-hero-value" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", fontWeight: 600, color: "#1a2230" }}>
                {t("home.detectedFrameworkValue")}
              </div>
              <div style={{ marginTop: "8px", height: "4px", width: "100%", background: "#e6eaf0", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: "95%", background: "#2f6bff", borderRadius: "2px" }} />
              </div>
              <div className="rc-hero-note" style={{ fontSize: "11px", color: "#64707f", marginTop: "4px" }}>
                {t("home.confidence", { pct: 95 })}
              </div>
            </div>

            <div className="rc-hero-card rc-hero-card-qs" style={{
              position: "absolute",
              bottom: "60px",
              left: "60px",
              zIndex: 2,
              background: "#ffffff",
              border: "1px solid #c8cfda",
              padding: "20px",
              boxShadow: "0 10px 40px rgba(64, 128, 255, 0.35)",
              width: "260px",
              fontSize: "12px",
            }}>
              <div className="rc-hero-label" style={{ fontSize: "11px", fontWeight: 600, color: "#64707f", marginBottom: "8px", letterSpacing: "0.05em" }}>
                {t("home.qualityScore")}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span className="rc-hero-num" style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "36px", fontWeight: 300, color: "#1f9d55" }}>92</span>
                <span className="rc-hero-den" style={{ color: "#64707f" }}>/ 100</span>
              </div>
              <div className="rc-hero-note" style={{ fontSize: "12px", color: "#1f9d55", marginTop: "4px", fontWeight: 500 }}>
                {t("home.excellentContext")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by / Stats band */}
      <section style={{
        padding: "48px",
        background: "white",
        borderBottom: "1px solid var(--rule)",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            textAlign: "center",
            marginBottom: "32px",
          }}>
            {t("home.trustedBy")}
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "48px",
            textAlign: "center",
          }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>4</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>{t("home.statRepos")}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>60s</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>{t("home.statAccuracy")}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>4/mo</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>{t("home.statOnboarding")}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>20+</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>{t("home.statStacks")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "96px 48px", background: "var(--bg-warm)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ marginBottom: "64px" }}>
            <div style={{ width: "48px", height: "4px", background: "var(--blue-60)", marginBottom: "24px" }} />
            <p style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "16px",
            }}>
              {t("home.featuresEyebrow")}
            </p>
            <h2 style={{
              fontFamily: "'IBM Plex Serif', Georgia, serif",
              fontSize: "42px",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              margin: "0 0 16px 0",
              maxWidth: "700px",
            }}>
              {t("home.featuresTitle")}
            </h2>
            <p style={{ fontSize: "17px", color: "var(--ink-2)", maxWidth: "600px" }}>
              {t("home.featuresSubtitle")}
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "var(--rule)",
            border: "1px solid var(--rule)",
          }}>
            {[
              {
                title: dict.home.features[0]?.title ?? "",
                desc: dict.home.features[0]?.desc ?? "",
                illustration: {
                  src: "/features/01-scanning/01-scanning.png",
                  alt: dict.home.features[0]?.title ?? "",
                },
              },
              {
                title: dict.home.features[1]?.title ?? "",
                desc: dict.home.features[1]?.desc ?? "",
                illustration: {
                  src: "/features/02-export/02-export.png",
                  alt: dict.home.features[1]?.title ?? "",
                },
              },
              {
                title: dict.home.features[2]?.title ?? "",
                desc: dict.home.features[2]?.desc ?? "",
                illustration: {
                  src: "/features/03-evidence/03-evidence.png",
                  alt: dict.home.features[2]?.title ?? "",
                },
              },
              {
                title: dict.home.features[3]?.title ?? "",
                desc: dict.home.features[3]?.desc ?? "",
                illustration: {
                  src: "/features/04-quality/04-quality.png",
                  alt: dict.home.features[3]?.title ?? "",
                },
              },
              {
                title: dict.home.features[4]?.title ?? "",
                desc: dict.home.features[4]?.desc ?? "",
                illustration: {
                  src: "/features/05-audit/05-audit.png",
                  alt: dict.home.features[4]?.title ?? "",
                },
              },
              {
                title: dict.home.features[5]?.title ?? "",
                desc: dict.home.features[5]?.desc ?? "",
                illustration: {
                  src: "/features/06-private/06-private.png",
                  alt: dict.home.features[5]?.title ?? "",
                },
              },
            ].map((item) => (
              <div key={item.title} style={{
                background: "white",
                padding: "40px 32px",
                display: "flex",
                flexDirection: "column",
              }}>
                <MaskedIllustration src={item.illustration.src} alt={item.illustration.alt} size={80} />
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  margin: "0 0 12px 0",
                  lineHeight: 1.4,
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available now */}
      <section style={{ padding: "0 48px 96px 48px", background: "var(--bg-warm)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ marginBottom: "48px" }}>
            <div style={{ width: "48px", height: "4px", background: "var(--blue-30)", marginBottom: "24px" }} />
            <p style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "16px",
            }}>
              {t("home.roadmapEyebrow")}
            </p>
            <h2 style={{
              fontFamily: "'IBM Plex Serif', Georgia, serif",
              fontSize: "36px",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              margin: "0 0 12px 0",
              maxWidth: "700px",
            }}>
              {t("home.roadmapTitle")}
            </h2>
            <p style={{ fontSize: "16px", color: "var(--ink-2)", maxWidth: "600px", margin: 0 }}>
              {t("home.roadmapSubtitle")}
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}>
            {[
              {
                title: dict.home.roadmap[0]?.title ?? "",
                desc: dict.home.roadmap[0]?.desc ?? "",
                eta: dict.home.roadmap[0]?.eta ?? "",
                available: dict.home.roadmap[0]?.available ?? false,
                href: "/",
              },
              {
                title: dict.home.roadmap[1]?.title ?? "",
                desc: dict.home.roadmap[1]?.desc ?? "",
                eta: dict.home.roadmap[1]?.eta ?? "",
                available: dict.home.roadmap[1]?.available ?? false,
                href: "/developers",
              },
              {
                title: dict.home.roadmap[2]?.title ?? "",
                desc: dict.home.roadmap[2]?.desc ?? "",
                eta: dict.home.roadmap[2]?.eta ?? "",
                available: dict.home.roadmap[2]?.available ?? false,
                href: "/templates",
              },
              {
                title: dict.home.roadmap[3]?.title ?? "",
                desc: dict.home.roadmap[3]?.desc ?? "",
                eta: dict.home.roadmap[3]?.eta ?? "",
                available: dict.home.roadmap[3]?.available ?? false,
                href: "/developers",
              },
            ].map((item) => (
              <RoadmapCard key={item.title} item={item} />
            ))}
          </div>

          <div style={{
            marginTop: "32px",
            padding: "20px 28px",
            background: "white",
            border: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
          }}>
            <div>
              <p style={{
                fontSize: "15px",
                fontWeight: 600,
                margin: "0 0 4px 0",
                color: "var(--ink)",
              }}>
                {t("home.waitlistTitle")}
              </p>
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
                {t("home.waitlistSubtitle")}
              </p>
            </div>
            {waitlistState === "done" ? (
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--ink)",
                  margin: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {t("home.waitlistDone")}
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void joinWaitlist()
                }}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="email"
                  required
                  value={waitlistEmail}
                  onChange={(e) => {
                    setWaitlistEmail(e.target.value)
                    if (waitlistState === "error") setWaitlistState("idle")
                  }}
                  placeholder={t("home.waitlistPlaceholder")}
                  aria-label={t("home.waitlistPlaceholder")}
                  style={{
                    padding: "11px 14px",
                    border: `1px solid ${waitlistState === "error" ? "#da1e28" : "var(--rule)"}`,
                    fontSize: "14px",
                    fontFamily: "inherit",
                    color: "var(--ink)",
                    outline: "none",
                    minWidth: "240px",
                    flex: "1 1 240px",
                    background: "white",
                  }}
                />
                <button
                  type="submit"
                  disabled={waitlistState === "sending"}
                  onMouseEnter={() => setWaitlistHover(true)}
                  onMouseLeave={() => setWaitlistHover(false)}
                  style={{
                    padding: "12px 24px",
                    background: waitlistHover ? "#2a2a2a" : "var(--ink)",
                    color: "white",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: waitlistState === "sending" ? "not-allowed" : "pointer",
                    opacity: waitlistState === "sending" ? 0.7 : 1,
                    whiteSpace: "nowrap",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: waitlistHover
                      ? "0 0 28px rgba(255,255,255,0.35), 0 0 12px rgba(255,255,255,0.2)"
                      : "0 0 0 rgba(255,255,255,0)",
                    transform: waitlistHover ? "translateY(-1px)" : "translateY(0)",
                  }}
                >
                  {waitlistState === "sending"
                    ? t("home.waitlistSending")
                    : t("home.waitlistCta")}
                </button>
              </form>
            )}
          </div>
          {waitlistState === "error" && (
            <p style={{ fontSize: "13px", color: "#da1e28", margin: "8px 0 0" }}>
              {t("home.waitlistError")}
            </p>
          )}
        </div>
      </section>

      {/* How to use — flat line illustration tutorial */}
      <section id="how" style={{ padding: "96px 48px", background: "white" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ marginBottom: "64px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div style={{ width: "48px", height: "4px", background: "var(--blue-60)", marginBottom: "24px" }} />
              <p style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "16px",
              }}>
                {t("home.howEyebrow")}
              </p>
              <h2 style={{
                fontFamily: "'IBM Plex Serif', Georgia, serif",
                fontSize: "42px",
                fontWeight: 300,
                letterSpacing: "-0.01em",
                margin: 0,
                maxWidth: "700px",
              }}>
                {t("home.howTitle")}
              </h2>
            </div>
            <GlowLink href="/how-to-use" style={{ fontSize: "15px", color: "var(--blue-60)", textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}>
              {t("home.howLink")}
            </GlowLink>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "48px",
          }}>
            {[
              {
                step: "01",
                title: dict.home.steps[0]?.title ?? "",
                desc: dict.home.steps[0]?.desc ?? "",
                illustration: (
                  <MaskedIllustration
                    src="/illustrations/step1-paste-url.png"
                    alt={dict.home.steps[0]?.title ?? ""}
                    size={140}
                  />
                ),
              },
              {
                step: "02",
                title: dict.home.steps[1]?.title ?? "",
                desc: dict.home.steps[1]?.desc ?? "",
                illustration: (
                  <MaskedIllustration
                    src="/illustrations/step2-ai-scan.png"
                    alt={dict.home.steps[1]?.title ?? ""}
                    size={140}
                  />
                ),
              },
              {
                step: "03",
                title: dict.home.steps[2]?.title ?? "",
                desc: dict.home.steps[2]?.desc ?? "",
                illustration: (
                  <MaskedIllustration
                    src="/illustrations/step3-export.png"
                    alt={dict.home.steps[2]?.title ?? ""}
                    size={140}
                  />
                ),
              },
            ].map((item) => (
              <div key={item.step} style={{ position: "relative" }}>
                {item.illustration}
                <div style={{
                  fontFamily: "'IBM Plex Serif', serif",
                  fontSize: "80px",
                  fontWeight: 300,
                  color: "var(--blue-10)",
                  lineHeight: 1,
                  marginBottom: "16px",
                }}>
                  {item.step}
                </div>
                <h3 style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  margin: "0 0 12px 0",
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "15px", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community teaser */}
      <section className="rc-home-community" style={{
        padding: "96px 48px",
        background: "var(--bg-warm)",
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.25fr",
          gap: "64px",
          alignItems: "start",
        }}>
          {/* Left: pitch + CTAs */}
          <div>
            <div style={{ width: "48px", height: "4px", background: "var(--blue-60)", marginBottom: "24px" }} />
            <p style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              margin: "0 0 16px 0",
            }}>
              {t("forge.eyebrow")}
            </p>
            <h2 style={{
              fontFamily: "'IBM Plex Serif', Georgia, serif",
              fontSize: "42px",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              margin: "0 0 16px 0",
              maxWidth: "460px",
            }}>
              {t("home.forgeTitle")}
            </h2>
            <p style={{ fontSize: "17px", color: "var(--ink-2)", lineHeight: 1.6, maxWidth: "440px", margin: "0 0 32px" }}>
              {t("home.forgeSubtitle")}
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link
                href="/forge/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 26px",
                  background: "var(--blue-60)",
                  color: "white",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                }}
              >
                {t("home.forgeNew")} →
              </Link>
              <Link
                href="/forge"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "13px 26px",
                  border: "2px solid var(--rule)",
                  color: "var(--ink)",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: "15px",
                }}
              >
                {t("home.forgeCta")}
              </Link>
            </div>
          </div>

          {/* Right: live preview of top projects */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {topPosts.map((p) => (
              <ForgeProjectCard
                key={p.slug}
                project={p}
                starred={false}
                onStar={() => {}}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "96px 48px",
        background: "var(--blue-90)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "48px",
            fontWeight: 300,
            letterSpacing: "-0.01em",
            margin: "0 0 20px 0",
          }}>
            {t("home.ctaTitle")}
          </h2>
          <p style={{
            fontSize: "18px",
            color: "var(--blue-20)",
            marginBottom: "40px",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            {t("home.ctaBody")}
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link
              href="/pricing"
              style={{
                padding: "16px 32px",
                background: "white",
                color: "var(--blue-90)",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              {t("home.ctaPrimary")}
            </Link>
            <a
              href="#features"
              style={{
                padding: "15px 32px",
                border: "2px solid rgba(255,255,255,0.5)",
                color: "white",
                fontSize: "15px",
                fontWeight: 500,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              {t("home.ctaSecondary")}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "#0a0a0a",
        color: "white",
        padding: "64px 48px 32px",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "48px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ width: "36px", height: "36px", position: "relative" }}>
                  <Image
                    src="/logo-light.png"
                    alt="RepoContext"
                    fill
                    sizes="36px"
                    style={{ objectFit: "contain", backgroundColor: "transparent" }}
                    quality={95}
                  />
                </div>
                <span style={{ fontSize: "18px", fontWeight: 600 }}>RepoContext</span>
              </div>
              <p style={{
                fontSize: "14px",
                color: "#949494",
                lineHeight: 1.6,
                maxWidth: "320px",
              }}>
                {t("footer.tagline")}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                {t("footer.productTitle")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <GlowLink href="/pricing" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.pricing")}</GlowLink>
              <GlowLink href="#features" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.features")}</GlowLink>
              <GlowLink href="/docs" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.docs")}</GlowLink>
              <GlowLink href="/docs#api" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.api")}</GlowLink>
            </div>
          </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                {t("footer.resourcesTitle")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <GlowLink href="/changelog" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.changelog")}</GlowLink>
                <GlowLink href="/docs" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.spec")}</GlowLink>
                <GlowLink href="/startup-check" style={{ color: "#949494", textDecoration: "none" }}>Status check</GlowLink>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                {t("footer.companyTitle")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <GlowLink href="/terms" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.terms")}</GlowLink>
                <GlowLink href="/privacy" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.privacy")}</GlowLink>
                <GlowLink href="/refund" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.refund")}</GlowLink>
                <GlowLink href="/acceptable-use" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.aup")}</GlowLink>
                <GlowLink href="mailto:support@repocontext.dev" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.contact")}</GlowLink>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid #2a2a2a",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            color: "#6f6f6f",
          }}>
            <span>{t("footer.copyright")}</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
