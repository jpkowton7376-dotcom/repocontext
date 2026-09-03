"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MaskedIllustration } from "@/components/MaskedIllustration"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [analyzeHover, setAnalyzeHover] = useState(false)
  const [waitlistHover, setWaitlistHover] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const checkUser = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      setUser(user || null)
    }
    checkUser()

    const { data: authListener } = supabase!.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Analysis failed")
      // Persist full payload (including formats / audit / evidence) for the result page
      try {
        sessionStorage.setItem("repoResult", JSON.stringify(data))
      } catch {
        // sessionStorage may be full or unavailable; the result page will redirect home
      }
      router.push(`/result?repo=${encodeURIComponent(url.trim())}`)
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

  function GlowLink({
    href,
    children,
    style = {},
  }: {
    href: string
    children: React.ReactNode
    style?: React.CSSProperties
  }) {
    const [hovered, setHovered] = useState(false)
    const glowStyle: React.CSSProperties = {
      ...style,
      transition: "text-shadow 0.2s ease, color 0.2s ease",
      color: hovered ? "#3b82f6" : style.color,
      textShadow: hovered ? "0 0 12px rgba(59, 130, 246, 0.85)" : "none",
    }
    if (href.startsWith("#")) {
      return (
        <a
          href={href}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={glowStyle}
        >
          {children}
        </a>
      )
    }
    return (
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={glowStyle}
      >
        {children}
      </Link>
    )
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top announcement bar */}
      <div style={{
        background: "#001085",
        color: "white",
        padding: "10px 24px",
        fontSize: "13px",
        textAlign: "center",
        fontWeight: 500,
      }}>
        New: Multi-format export — AGENTS.md · CLAUDE.md · Cursor Rules · Copilot Instructions
        <GlowLink href="/changelog" style={{ marginLeft: "12px", textDecoration: "underline", cursor: "pointer" }}>
          See what&apos;s new →
        </GlowLink>
      </div>

      {/* Navigation */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: "64px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "#111111",
        position: "sticky",
        top: 0,
        zIndex: 100,
        color: "white",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
          <GlowLink href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
            <div style={{ width: "36px", height: "36px", position: "relative" }}>
              <Image
                src="/logo-dark.png"
                alt="RepoContext"
                fill
                sizes="36px"
                style={{ objectFit: "contain", backgroundColor: "transparent" }}
                priority
                quality={95}
              />
            </div>
            <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em", color: "white" }}>
              RepoContext
            </span>
          </GlowLink>
          <div style={{ display: "flex", gap: "32px", fontSize: "14px" }}>
            <GlowLink href="#features" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>Features</GlowLink>
            <GlowLink href="#how" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>How it works</GlowLink>
            <GlowLink href="/pricing" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>Pricing</GlowLink>
            <GlowLink href="/docs" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>Documentation</GlowLink>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user ? (
            <GlowLink
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                color: "white",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 500 }}>
                Dashboard
              </span>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--blue-50)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}>
                {user.email?.charAt(0) || "U"}
              </div>
            </GlowLink>
          ) : (
            <>
              <GlowLink
                href="/login"
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.9)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Sign in
              </GlowLink>
              <Link
                href="/pricing"
                style={{
                  fontSize: "14px",
                  padding: "10px 20px",
                  background: "white",
                  color: "#111111",
                  textDecoration: "none",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                Try it free
              </Link>
            </>
          )}
        </div>
      </nav>

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
              Enterprise AI Development
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
              Turn your codebase
              <br />
              into <span style={{ color: "#6ea8ff", fontWeight: 500 }}>AI-ready</span> context.
            </h1>
            <p style={{
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#c8d0dc",
              marginBottom: "36px",
              maxWidth: "520px",
            }}>
              RepoContext analyzes your GitHub repositories and generates accurate,
              structured documentation for AI coding agents. Reduce hallucinations,
              increase productivity, and ship faster.
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
                    placeholder="github.com/owner/repository"
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
                      if (!url) e.target.placeholder = "github.com/owner/repository"
                    }}
                  />
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
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                    boxShadow: analyzeHover
                      ? "0 0 32px rgba(47, 107, 255, 0.6), 0 8px 24px rgba(47, 107, 255, 0.4)"
                      : "0 4px 16px rgba(47, 107, 255, 0.25)",
                    transform: analyzeHover ? "translateY(-2px)" : "translateY(0)",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  {loading ? "Analyzing..." : "Analyze →"}
                </button>
              </div>
              {error && (
                <p style={{ color: "#ff6b7a", fontSize: "14px", marginTop: "12px" }}>
                  {error}
                </p>
              )}
            </form>

            <p style={{ fontSize: "13px", color: "#8b95a8" }}>
              Try it with <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6ea8ff", cursor: "pointer" }} onClick={() => setUrl("psf/requests")}>psf/requests</span>
              {" · "}
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6ea8ff", cursor: "pointer" }} onClick={() => setUrl("vercel/next.js")}>vercel/next.js</span>
              {" · "}
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6ea8ff", cursor: "pointer" }} onClick={() => setUrl("gin-gonic/gin")}>gin-gonic/gin</span>
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
                DETECTED FRAMEWORK
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", fontWeight: 600, color: "#1a2230" }}>
                Next.js 14
              </div>
              <div style={{ marginTop: "8px", height: "4px", width: "100%", background: "#e6eaf0", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: "95%", background: "#2f6bff", borderRadius: "2px" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#64707f", marginTop: "4px" }}>
                95% confidence
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
                QUALITY SCORE
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "36px", fontWeight: 300, color: "#1f9d55" }}>92</span>
                <span style={{ color: "#64707f" }}>/ 100</span>
              </div>
              <div style={{ fontSize: "12px", color: "#1f9d55", marginTop: "4px", fontWeight: 500 }}>
                ↑ Excellent context quality
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
            Trusted by engineering teams at leading companies
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "48px",
            textAlign: "center",
          }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>10K+</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>Repositories analyzed</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>94%</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>Command accuracy</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>2.5x</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>Faster AI onboarding</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "48px", fontWeight: 300, color: "var(--blue-70)", lineHeight: 1 }}>50+</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>Tech stacks supported</div>
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
              Capabilities
            </p>
            <h2 style={{
              fontFamily: "'IBM Plex Serif', Georgia, serif",
              fontSize: "42px",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              margin: "0 0 16px 0",
              maxWidth: "700px",
            }}>
              Everything you need to make AI work with your codebase.
            </h2>
            <p style={{ fontSize: "17px", color: "var(--ink-2)", maxWidth: "600px" }}>
              From detection to documentation, RepoContext provides enterprise-grade
              analysis of your repositories with verifiable evidence.
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
                title: "Intelligent Repository Scanning",
                desc: "Deep analysis of package managers, build tools, CI/CD pipelines, test frameworks, and directory structure.",
                illustration: {
                  src: "/features/01-scanning/01-scanning.png",
                  alt: "Magnifying glass icon representing intelligent repository scanning",
                },
              },
              {
                title: "Multi-Format Export",
                desc: "Generate AGENTS.md, CLAUDE.md, Cursor Rules, and Copilot Instructions from a single analysis.",
                illustration: {
                  src: "/features/02-export/02-export.png",
                  alt: "Document icon representing multi-format export",
                },
              },
              {
                title: "Evidence-Based Output",
                desc: "Every claim is backed by verifiable evidence. See exactly which files were used to generate each insight.",
                illustration: {
                  src: "/features/03-evidence/03-evidence.png",
                  alt: "Shield icon representing evidence-based output",
                },
              },
              {
                title: "Quality Score",
                desc: "Get a numerical quality score so you know how reliable the generated context actually is.",
                illustration: {
                  src: "/features/04-quality/04-quality.png",
                  alt: "Bar chart icon representing quality score",
                },
              },
              {
                title: "AGENTS.md Audit",
                desc: "Already have an AGENTS.md? We audit it for accuracy, completeness, and outdated information.",
                illustration: {
                  src: "/features/05-audit/05-audit.png",
                  alt: "Document audit icon representing AGENTS.md audit",
                },
              },
              {
                title: "Private Repository Support",
                desc: "Securely connect your private repos. Your code never leaves your control.",
                illustration: {
                  src: "/features/06-private/06-private.png",
                  alt: "Padlock icon representing private repository support",
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
              On the roadmap
            </p>
            <h2 style={{
              fontFamily: "'IBM Plex Serif', Georgia, serif",
              fontSize: "36px",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              margin: "0 0 12px 0",
              maxWidth: "700px",
            }}>
              More power, coming soon.
            </h2>
            <p style={{ fontSize: "16px", color: "var(--ink-2)", maxWidth: "600px", margin: 0 }}>
              We&apos;re building the next generation of repository intelligence. Here&apos;s what&apos;s on the way.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}>
            {[
              {
                title: "Monorepo Support",
                desc: "TurboRepo, Nx, Lerna — deep analysis of complex multi-package repositories.",
                eta: "Q4 2026",
              },
              {
                title: "Custom AI Agents",
                desc: "Build and train custom AI agents tuned to your specific codebase patterns.",
                eta: "Q4 2026",
              },
              {
                title: "GitLab & Bitbucket",
                desc: "Connect repositories from GitLab, Bitbucket, and self-hosted platforms.",
                eta: "Q1 2027",
              },
              {
                title: "Team Collaboration",
                desc: "Shared workspaces, comments, reviews, and approval workflows for teams.",
                eta: "Q1 2027",
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
                Want early access to new features?
              </p>
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
                Join the waitlist and be the first to try what&apos;s next.
              </p>
            </div>
            <button
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
              Join the waitlist →
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
                How to use
              </p>
              <h2 style={{
                fontFamily: "'IBM Plex Serif', Georgia, serif",
                fontSize: "42px",
                fontWeight: 300,
                letterSpacing: "-0.01em",
                margin: 0,
                maxWidth: "700px",
              }}>
                Three steps. Zero configuration.
              </h2>
            </div>
            <GlowLink href="/how-to-use" style={{ fontSize: "15px", color: "var(--blue-60)", textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}>
              View full guide →
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
                title: "Paste your repository URL",
                desc: "Copy any public GitHub repo link and paste it into the analyzer input above.",
                illustration: (
                  <MaskedIllustration
                    src="/illustrations/step1-paste-url.png"
                    alt="Paste your repository URL"
                    size={140}
                  />
                ),
              },
              {
                step: "02",
                title: "Let AI scan your codebase",
                desc: "RepoContext reads package managers, build tools, tests, and directory structure.",
                illustration: (
                  <MaskedIllustration
                    src="/illustrations/step2-ai-scan.png"
                    alt="AI scans your codebase"
                    size={140}
                  />
                ),
              },
              {
                step: "03",
                title: "Export AI-ready context",
                desc: "Download AGENTS.md, CLAUDE.md, Cursor Rules, or Copilot Instructions in one click.",
                illustration: (
                  <MaskedIllustration
                    src="/illustrations/step3-export.png"
                    alt="Export AI-ready context"
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
            Ready to make AI work for your codebase?
          </h2>
          <p style={{
            fontSize: "18px",
            color: "var(--blue-20)",
            marginBottom: "40px",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            Start analyzing your repositories in seconds. No credit card required.
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
              Start free trial
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
              Learn more
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
                Enterprise-grade repository analysis for AI development teams.
                Turn your codebase into AI-ready context.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                PRODUCT
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <GlowLink href="/pricing" style={{ color: "#949494", textDecoration: "none" }}>Pricing</GlowLink>
                <GlowLink href="#features" style={{ color: "#949494", textDecoration: "none" }}>Features</GlowLink>
                <GlowLink href="/docs" style={{ color: "#949494", textDecoration: "none" }}>Documentation</GlowLink>
                <GlowLink href="/docs#api" style={{ color: "#949494", textDecoration: "none" }}>API</GlowLink>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                RESOURCES
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <GlowLink href="#" style={{ color: "#949494", textDecoration: "none" }}>Blog</GlowLink>
                <GlowLink href="#" style={{ color: "#949494", textDecoration: "none" }}>Changelog</GlowLink>
                <GlowLink href="#" style={{ color: "#949494", textDecoration: "none" }}>AGENTS.md Spec</GlowLink>
                <GlowLink href="#" style={{ color: "#949494", textDecoration: "none" }}>Community</GlowLink>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                COMPANY
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <GlowLink href="/terms" style={{ color: "#949494", textDecoration: "none" }}>Terms</GlowLink>
                <GlowLink href="/privacy" style={{ color: "#949494", textDecoration: "none" }}>Privacy</GlowLink>
                <GlowLink href="/refund" style={{ color: "#949494", textDecoration: "none" }}>Refund policy</GlowLink>
                <GlowLink href="#" style={{ color: "#949494", textDecoration: "none" }}>Contact</GlowLink>
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
            <span>© 2026 RepoContext. All rights reserved.</span>
            <div style={{ display: "flex", gap: "24px" }}>
              <GlowLink href="#" style={{ color: "#6f6f6f", textDecoration: "none" }}>GitHub</GlowLink>
              <GlowLink href="#" style={{ color: "#6f6f6f", textDecoration: "none" }}>Twitter</GlowLink>
              <GlowLink href="#" style={{ color: "#6f6f6f", textDecoration: "none" }}>LinkedIn</GlowLink>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
