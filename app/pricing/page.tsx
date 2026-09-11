"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef } from "react"
import { useTranslation } from "@/components/LanguageProvider"
import { SiteNav } from "@/components/SiteNav"
import { FREE_TRIAL_LIMIT, PRO_TRIAL_LIMIT } from "@/lib/trial"

export default function PricingPage() {
  const { t, dict } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "team" | "lifetime" | null>(null)
  const [agreed, setAgreed] = useState(false)
  const proFormRef = useRef<HTMLFormElement>(null)
  const teamFormRef = useRef<HTMLFormElement>(null)
  const lifetimeFormRef = useRef<HTMLFormElement>(null)

  const openCheckout = (plan: "pro" | "team" | "lifetime") => {
    setSelectedPlan(plan)
    setAgreed(false)
    setModalOpen(true)
  }

  const confirmCheckout = () => {
    if (!agreed) return
    setModalOpen(false)
    if (selectedPlan === "pro") {
      proFormRef.current?.submit()
    } else if (selectedPlan === "team") {
      teamFormRef.current?.submit()
    } else if (selectedPlan === "lifetime") {
      lifetimeFormRef.current?.submit()
    }
  }

  const p = dict.pricing

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Nav */}
      <SiteNav variant="light" />

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
            {t("pricing.eyebrow")}
          </p>
          <h1 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "52px",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            margin: "0 0 20px 0",
          }}>
            {t("pricing.title")}
          </h1>
          <p style={{
            fontSize: "18px",
            color: "var(--ink-2)",
            lineHeight: 1.6,
            maxWidth: "560px",
            margin: "0 auto",
          }}>
            {t("pricing.subtitle")}
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section style={{ padding: "0 48px 96px" }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
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
              {p.free.name}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{
                fontFamily: "'IBM Plex Serif', serif",
                fontSize: "48px",
                fontWeight: 300,
                lineHeight: 1,
              }}>
                {p.free.price}
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "4px" }}>
              {p.free.period}
            </p>
            <p style={{ fontSize: "13px", color: "var(--muted-2)", marginBottom: "32px" }}>
              {p.free.qualityNote}
            </p>

            <div style={{ flex: 1, marginBottom: "32px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {p.free.features.map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "14px",
                    padding: "8px 0",
                    borderBottom: i < p.free.features.length - 1 ? "1px solid var(--rule-2)" : "none",
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
              {p.free.cta}
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
            borderRight: "1px solid rgba(255,255,255,0.2)",
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
              {t("pricing.mostPopular")}
            </div>

            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--blue-30)",
              marginBottom: "16px",
            }}>
              {p.pro.name}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{
                fontFamily: "'IBM Plex Serif', serif",
                fontSize: "48px",
                fontWeight: 300,
                lineHeight: 1,
              }}>
                {p.pro.price}
              </span>
              <span style={{ fontSize: "16px", color: "var(--blue-20)" }}>{p.pro.period}</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--blue-20)", marginBottom: "4px" }}>
              {p.pro.tagline}
            </p>
            <p style={{ fontSize: "13px", color: "var(--blue-30)", marginBottom: "32px" }}>
              {p.pro.qualityNote}
            </p>

            <div style={{ flex: 1, marginBottom: "32px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {p.pro.features.map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "14px",
                    padding: "8px 0",
                    borderBottom: i < p.pro.features.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: "var(--blue-30)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => openCheckout("pro")}
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
              {p.pro.cta}
            </button>
            <p style={{
              fontSize: "12px",
              color: "var(--blue-30)",
              textAlign: "center",
              marginTop: "12px",
              marginBottom: 0,
            }}>
              {t("pricing.pro.trialNote", { pro: PRO_TRIAL_LIMIT, free: FREE_TRIAL_LIMIT })}
            </p>
          </div>

          {/* Pro (annual) */}
          <div style={{
            background: "#0F62FE",
            color: "white",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid rgba(255,255,255,0.2)",
          }}>
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "16px",
            }}>
              {p.annual.name}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{
                fontFamily: "'IBM Plex Serif', serif",
                fontSize: "48px",
                fontWeight: 300,
                lineHeight: 1,
              }}>
                {p.annual.price}
              </span>
              <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)" }}>{p.annual.period}</span>
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", marginBottom: "4px" }}>
              {p.annual.tagline}
            </p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "32px" }}>
              {p.annual.qualityNote}
            </p>

            <div style={{ flex: 1, marginBottom: "32px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {p.annual.features.map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "14px",
                    padding: "8px 0",
                    borderBottom: i < p.annual.features.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: "white", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => openCheckout("team")}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                padding: "14px 24px",
                background: "white",
                border: "2px solid white",
                color: "#0F62FE",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e8f0ff"
                e.currentTarget.style.borderColor = "#e8f0ff"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white"
                e.currentTarget.style.borderColor = "white"
              }}
            >
              {p.annual.cta}
            </button>
          </div>

          {/* Pro (lifetime) */}
          <div style={{
            background: "#FE7F0F",
            color: "white",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
              marginBottom: "16px",
            }}>
              {p.lifetime.name}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{
                fontFamily: "'IBM Plex Serif', serif",
                fontSize: "48px",
                fontWeight: 300,
                lineHeight: 1,
              }}>
                {p.lifetime.price}
              </span>
              <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)" }}>{p.lifetime.period}</span>
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", marginBottom: "4px" }}>
              {p.lifetime.tagline}
            </p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "32px" }}>
              {p.lifetime.qualityNote}
            </p>

            <div style={{ flex: 1, marginBottom: "32px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {p.lifetime.features.map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "14px",
                    padding: "8px 0",
                    borderBottom: i < p.lifetime.features.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                    color: "rgba(255,255,255,0.95)",
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: "white", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => openCheckout("lifetime")}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                padding: "14px 24px",
                background: "white",
                border: "2px solid white",
                color: "#FE7F0F",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fff0e6"
                e.currentTarget.style.borderColor = "#fff0e6"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white"
                e.currentTarget.style.borderColor = "white"
              }}
            >
              {p.lifetime.cta}
            </button>
          </div>
        </div>

        {/* Free vs Pro quality comparison */}
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
              margin: "0 0 16px 0",
              fontFamily: "'IBM Plex Serif', serif",
            }}>
              {p.comparisonTitle}
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              textAlign: "left",
              marginBottom: "24px",
            }}>
              <div style={{
                padding: "16px",
                background: "white",
                border: "1px solid var(--rule)",
              }}>
                <div style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "8px",
                }}>
                  {p.freeModel}
                </div>
                <p style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  margin: "0",
                  lineHeight: 1.5,
                }}>
                  {p.freeModelDesc}
                </p>
              </div>
              <div style={{
                padding: "16px",
                background: "var(--blue-90)",
                color: "white",
                border: "1px solid var(--blue-90)",
              }}>
                <div style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--blue-30)",
                  marginBottom: "8px",
                }}>
                  {p.proModel}
                </div>
                <p style={{
                  fontSize: "13px",
                  color: "var(--blue-20)",
                  margin: "0",
                  lineHeight: 1.5,
                }}>
                  {p.proModelDesc}
                </p>
              </div>
            </div>
            <p style={{
              fontSize: "15px",
              color: "var(--ink-2)",
              margin: "0 0 20px 0",
              lineHeight: 1.6,
            }}>
              {p.comparisonFooter}
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
              {p.tryFree}
            </Link>
          </div>
        </div>
      </section>

      {/* Hidden checkout forms */}
      <form ref={proFormRef} action="/api/creem/checkout" method="POST" style={{ display: "none" }}>
        <input type="hidden" name="plan" value="pro" />
      </form>
      <form ref={teamFormRef} action="/api/creem/checkout" method="POST" style={{ display: "none" }}>
        <input type="hidden" name="plan" value="team" />
      </form>
      <form ref={lifetimeFormRef} action="/api/creem/checkout" method="POST" style={{ display: "none" }}>
        <input type="hidden" name="plan" value="lifetime" />
      </form>

      {/* No-refund confirmation modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "24px",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              maxWidth: "440px",
              width: "100%",
              padding: "32px",
              border: "1px solid var(--rule)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontFamily: "'IBM Plex Serif', serif",
              fontSize: "24px",
              fontWeight: 300,
              margin: "0 0 16px 0",
              color: "var(--ink)",
            }}>
              {p.modalTitle}
            </h3>
            <p style={{
              fontSize: "14px",
              color: "var(--ink-2)",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}>
              {p.modalBody}
            </p>
            <label style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              fontSize: "14px",
              color: "var(--ink)",
              lineHeight: 1.5,
              marginBottom: "24px",
              cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: "2px", flexShrink: 0 }}
              />
              <span>
                {p.agreeLabel}
              </span>
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "white",
                  border: "1px solid var(--rule)",
                  color: "var(--ink)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {p.cancel}
              </button>
              <button
                type="button"
                onClick={confirmCheckout}
                disabled={!agreed}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: agreed ? "var(--blue-60)" : "var(--muted-2)",
                  border: "none",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: agreed ? "pointer" : "not-allowed",
                }}
              >
                {p.proceed}
              </button>
            </div>
          </div>
        </div>
      )}

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
                {t("footer.tagline")}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                {t("footer.productTitle")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <Link href="/pricing" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.pricing")}</Link>
                <Link href="/" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.features")}</Link>
                <Link href="/docs" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.docs")}</Link>
                <Link href="/docs#api" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.api")}</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                {t("footer.resourcesTitle")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <a href="/changelog" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.changelog")}</a>
                <a href="/docs" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.spec")}</a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 16px 0", letterSpacing: "0.05em" }}>
                {t("footer.companyTitle")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <Link href="/terms" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.terms")}</Link>
                <Link href="/privacy" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.privacy")}</Link>
                <Link href="/refund" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.refund")}</Link>
                <Link href="/acceptable-use" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.aup")}</Link>
                <a href="mailto:support@repocontext.com" style={{ color: "#949494", textDecoration: "none" }}>{t("footer.contact")}</a>
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
              <a
                href="https://github.com/jpkowton7376-dotcom/repocontext"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#6f6f6f", textDecoration: "none" }}
              >
                {t("footer.github")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
