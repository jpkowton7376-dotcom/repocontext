"use client"

import Link from "next/link"
import Image from "next/image"

export default function PricingPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Nav */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: "64px",
        borderBottom: "1px solid var(--rule)",
        background: "white",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
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
          <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>
            RepoContext
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            href="/login"
            style={{
              fontSize: "14px",
              color: "var(--ink)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: "14px",
              padding: "10px 20px",
              background: "var(--blue-60)",
              color: "white",
              textDecoration: "none",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Pricing hero */}
      <section style={{
        padding: "80px 48px 40px",
        textAlign: "center",
        background: "linear-gradient(180deg, #f2f4f8 0%, white 100%)",
      }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ width: "48px", height: "4px", background: "var(--blue-60)", margin: "0 auto 24px" }} />
          <p style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "16px",
          }}>
            Pricing
          </p>
          <h1 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "52px",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            margin: "0 0 20px 0",
          }}>
            Simple, transparent pricing.
          </h1>
          <p style={{
            fontSize: "18px",
            color: "var(--ink-2)",
            lineHeight: 1.6,
            maxWidth: "560px",
            margin: "0 auto",
          }}>
            Start free. Upgrade when you need more power. No hidden fees.
            Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section style={{ padding: "0 48px 96px" }}>
        <div style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0",
          border: "1px solid var(--rule)",
        }}>
          {/* Free */}
          <div style={{
            background: "white",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--rule)",
          }}>
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "16px",
            }}>
              Free
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{
                fontFamily: "'IBM Plex Serif', serif",
                fontSize: "48px",
                fontWeight: 300,
                lineHeight: 1,
              }}>
                $0
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "32px" }}>
              Forever free
            </p>

            <div style={{ flex: 1, marginBottom: "32px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Public repositories",
                  "3 analyses per day",
                  "AGENTS.md generation",
                  "Basic quality score",
                  "Copy & download",
                ].map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "14px",
                    padding: "8px 0",
                    borderBottom: i < 4 ? "1px solid var(--rule-2)" : "none",
                    color: "var(--ink-2)",
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: "var(--green-50)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/signup"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px 24px",
                background: "transparent",
                border: "2px solid var(--ink)",
                color: "var(--ink)",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--ink)"
                e.currentTarget.style.color = "white"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = "var(--ink)"
              }}
            >
              Get started free
            </Link>
          </div>

          {/* Pro — featured */}
          <div style={{
            background: "var(--blue-90)",
            color: "white",
            padding: "52px 32px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            borderRight: "1px solid var(--rule)",
          }}>
            <div style={{
              position: "absolute",
              top: "-1px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "6px 16px",
              background: "var(--blue-50)",
              color: "white",
            }}>
              Most Popular
            </div>

            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--blue-30)",
              marginBottom: "16px",
            }}>
              Pro
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{
                fontFamily: "'IBM Plex Serif', serif",
                fontSize: "48px",
                fontWeight: 300,
                lineHeight: 1,
              }}>
                $9
              </span>
              <span style={{ fontSize: "16px", color: "var(--blue-20)" }}>/month</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--blue-20)", marginBottom: "32px" }}>
              For serious developers
            </p>

            <div style={{ flex: 1, marginBottom: "32px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Everything in Free",
                  "Unlimited public repos",
                  "Private repositories",
                  "CLAUDE.md export",
                  "Cursor Rules export",
                  "Copilot Instructions export",
                  "Evidence panel",
                  "AGENTS.md Audit",
                  "Analysis history",
                  "Priority support",
                ].map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "14px",
                    padding: "8px 0",
                    borderBottom: i < 9 ? "1px solid rgba(255,255,255,0.1)" : "none",
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: "var(--blue-30)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form action="/api/creem/checkout" method="POST">
              <input type="hidden" name="plan" value="pro" />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  background: "white",
                  border: "none",
                  color: "var(--blue-90)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--blue-10)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white" }}
              >
                Start Pro trial
              </button>
            </form>
            <p style={{
              fontSize: "12px",
              color: "var(--blue-30)",
              textAlign: "center",
              marginTop: "12px",
              marginBottom: 0,
            }}>
              14-day free trial. No credit card needed.
            </p>
          </div>

          {/* Team */}
          <div style={{
            background: "white",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "16px",
            }}>
              Team
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{
                fontFamily: "'IBM Plex Serif', serif",
                fontSize: "48px",
                fontWeight: 300,
                lineHeight: 1,
              }}>
                $29
              </span>
              <span style={{ fontSize: "16px", color: "var(--muted)" }}>/month</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "32px" }}>
              For teams & automation
            </p>

            <div style={{ flex: 1, marginBottom: "32px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Everything in Pro",
                  "Team workspace",
                  "Shared repositories",
                  "GitHub App integration",
                  "Automatic sync",
                  "PR auto-generation",
                  "Audit history",
                  "SSO (coming soon)",
                  "Priority support",
                ].map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "14px",
                    padding: "8px 0",
                    borderBottom: i < 8 ? "1px solid var(--rule-2)" : "none",
                    color: "var(--ink-2)",
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: "var(--green-50)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="#"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px 24px",
                background: "transparent",
                border: "2px solid var(--ink)",
                color: "var(--ink)",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--ink)"
                e.currentTarget.style.color = "white"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = "var(--ink)"
              }}
            >
              Contact sales
            </Link>
          </div>
        </div>

        {/* FAQ / Notes */}
        <div style={{
          maxWidth: "720px",
          margin: "48px auto 0",
          textAlign: "center",
        }}>
          <div style={{
            padding: "32px 40px",
            background: "var(--bg-cool)",
            border: "1px solid var(--rule)",
          }}>
            <h3 style={{
              fontSize: "20px",
              fontWeight: 600,
              margin: "0 0 12px 0",
              fontFamily: "'IBM Plex Serif', serif",
            }}>
              Not sure which plan is right for you?
            </h3>
            <p style={{
              fontSize: "15px",
              color: "var(--ink-2)",
              margin: "0 0 20px 0",
              lineHeight: 1.6,
            }}>
              Start with the free plan and upgrade anytime. Your first 14 days of Pro are on us.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "var(--blue-60)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              Try it free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "#0a0a0a",
        color: "white",
        padding: "64px 48px 32px",
        marginTop: "auto",
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
                <Link href="/pricing" style={{ color: "#949494", textDecoration: "none" }}>Pricing</Link>
                <Link href="/" style={{ color: "#949494", textDecoration: "none" }}>Features</Link>
                <Link href="/docs" style={{ color: "#949494", textDecoration: "none" }}>Documentation</Link>
                <Link href="/docs#api" style={{ color: "#949494", textDecoration: "none" }}>API</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                RESOURCES
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <a href="#" style={{ color: "#949494", textDecoration: "none" }}>Blog</a>
                <a href="#" style={{ color: "#949494", textDecoration: "none" }}>Changelog</a>
                <a href="#" style={{ color: "#949494", textDecoration: "none" }}>AGENTS.md Spec</a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                COMPANY
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <Link href="/terms" style={{ color: "#949494", textDecoration: "none" }}>Terms</Link>
                <Link href="/privacy" style={{ color: "#949494", textDecoration: "none" }}>Privacy</Link>
                <Link href="/refund" style={{ color: "#949494", textDecoration: "none" }}>Refund policy</Link>
                <a href="#" style={{ color: "#949494", textDecoration: "none" }}>Contact</a>
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
              <a href="#" style={{ color: "#6f6f6f", textDecoration: "none" }}>GitHub</a>
              <a href="#" style={{ color: "#6f6f6f", textDecoration: "none" }}>Twitter</a>
              <a href="#" style={{ color: "#6f6f6f", textDecoration: "none" }}>LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
