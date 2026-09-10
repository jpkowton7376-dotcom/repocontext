"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MaskedIllustration } from "@/components/MaskedIllustration"
import { GlowLink } from "@/components/GlowLink"
import { SiteNav } from "@/components/SiteNav"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useTranslation } from "@/components/LanguageProvider"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

export default function HomePage() {
  const { t, dict } = useTranslation()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>("free")
  const [analyzeHover, setAnalyzeHover] = useState(false)
  const [waitlistHover, setWaitlistHover] = useState(false)
  const [userToken, setUserToken] = useState<string | null>(null)
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

  const handleSubmit = async (e?: React.FormEvent, overrideUrl?: string) => {
    e?.preventDefault()
    const target = (overrideUrl || url).trim()
    if (!target) return
    setUrl(target)
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: target, plan, userToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Analysis failed")
      // Persist full payload (including formats / audit / evidence) for the result page
      try {
        sessionStorage.setItem("repoResult", JSON.stringify(data))
      } catch {
        // sessionStorage may be full or unavailable; the result page will redirect home
      }
      router.push(`/result?repo=${encodeURIComponent(target)}`)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function RoadmapCard({ item }: { item: { title: string; desc: string; eta: string } }) {
    const [hovered, setHovered] = useState(false)
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "rgba(255,255,255,0.5)",
          padding: "32px 24px",
          border: "1px dashed var(--rule)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: hovered ? "scale(1.05)" : "scale(1)",
        }}
      >
        <span style={{
          display: "inline-block",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--blue-60)",
          background: "var(--blue-10)",
          padding: "4px 10px",
          marginBottom: "20px",
          alignSelf: "flex-start",
        }}>
          {item.eta}
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Coming soon
        </div>
      </div>
    )
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
      <section style={{
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

        <div style={{
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
            <p style={{
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
                      fontSize: "15px",
                      border: "2px solid rgba(92, 154, 255, 0.35)",
                      background: "#0e1420",
                      color: "#ffffff",
                      fontFamily: "'IBM Plex Mono', monospace",
                      outline: "none",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#5c9aff"; e.target.placeholder = "" }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(92, 154, 255, 0.35)"
                      if (!url) e.target.placeholder = t("home.inputPlaceholder")
                    }}
                  />
                  {loading && (
                    <>
                      <div className="charge-fill" />
                      <div className="charge-percent" />
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
                  {t("home.loadingHint")}
                </p>
              )}

              {error && (
                <p style={{ color: "#ff6b7a", fontSize: "14px", marginTop: "12px" }}>
                  {error}
                </p>
              )}
            </form>

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
          <div style={{ position: "relative", height: "600px" }}>
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
            <div style={{
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
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#64707f", marginBottom: "8px", letterSpacing: "0.05em" }}>
                {t("home.detectedFramework")}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", fontWeight: 600, color: "#1a2230" }}>
                {t("home.detectedFrameworkValue")}
              </div>
              <div style={{ marginTop: "8px", height: "4px", width: "100%", background: "#e6eaf0", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: "95%", background: "#2f6bff", borderRadius: "2px" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#64707f", marginTop: "4px" }}>
                {t("home.confidence", { pct: 95 })}
              </div>
            </div>

            <div style={{
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
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#64707f", marginBottom: "8px", letterSpacing: "0.05em" }}>
                {t("home.qualityScore")}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "36px", fontWeight: 300, color: "#1f9d55" }}>92</span>
                <span style={{ color: "#64707f" }}>/ 100</span>
              </div>
              <div style={{ fontSize: "12px", color: "#1f9d55", marginTop: "4px", fontWeight: 500 }}>
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
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>10K+</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>{t("home.statRepos")}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>94%</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>{t("home.statAccuracy")}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>2.5x</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>{t("home.statOnboarding")}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>50+</div>
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

      {/* Coming Soon */}
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
              },
              {
                title: dict.home.roadmap[1]?.title ?? "",
                desc: dict.home.roadmap[1]?.desc ?? "",
                eta: dict.home.roadmap[1]?.eta ?? "",
              },
              {
                title: dict.home.roadmap[2]?.title ?? "",
                desc: dict.home.roadmap[2]?.desc ?? "",
                eta: dict.home.roadmap[2]?.eta ?? "",
              },
              {
                title: dict.home.roadmap[3]?.title ?? "",
                desc: dict.home.roadmap[3]?.desc ?? "",
                eta: dict.home.roadmap[3]?.eta ?? "",
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
            <button
              onClick={() => {
                window.location.href =
                  "mailto:kowton@163.com?subject=" +
                  encodeURIComponent("RepoContext waitlist")
              }}
              onMouseEnter={() => setWaitlistHover(true)}
              onMouseLeave={() => setWaitlistHover(false)}
              style={{
                padding: "12px 24px",
                background: waitlistHover ? "#2a2a2a" : "var(--ink)",
                color: "white",
                border: "none",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: waitlistHover
                  ? "0 0 28px rgba(255,255,255,0.35), 0 0 12px rgba(255,255,255,0.2)"
                  : "0 0 0 rgba(255,255,255,0)",
                transform: waitlistHover ? "translateY(-1px)" : "translateY(0)",
              }}
            >
              {t("home.waitlistCta")}
            </button>
          </div>
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
                <GlowLink href="mailto:kowton@163.com" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.contact")}</GlowLink>
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
            <div style={{ display: "flex", gap: "24px" }}>
              <GlowLink
                href="https://github.com/jpkowton7376-dotcom/repocontext"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#6f6f6f", textDecoration: "none" }}
              >
                {t("footer.github")}
              </GlowLink>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
