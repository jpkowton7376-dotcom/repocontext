"use client"

import Link from "next/link"
import Image from "next/image"
import { MaskedIllustration } from "@/components/MaskedIllustration"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { useTranslation } from "@/components/LanguageProvider"

/** One illustration per step, matched by index. */
const STEP_IMAGES = [
  "/illustrations/how-to-use/step01-url.png",
  "/illustrations/how-to-use/step02-paste.png",
  "/illustrations/how-to-use/step03-analysis.png",
  "/illustrations/how-to-use/step04-quality.png",
  "/illustrations/how-to-use/step05-export.png",
]

export function HowToUseContent() {
  const { dict } = useTranslation()
  const d = dict.howto

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Header */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: "64px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        background: "white",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
          <div style={{ width: "36px", height: "36px", position: "relative" }}>
            <Image
              src="/logo-dark.png"
              alt="RepoContext"
              fill
              sizes="36px"
              style={{ objectFit: "contain", backgroundColor: "transparent" }}
            />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)" }}>
            RepoContext
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <LanguageSwitcher variant="light" />
          <Link
            href="/"
            style={{
              fontSize: "14px",
              color: "var(--blue-60)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {d.footerHome}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "80px 48px 64px", background: "var(--bg-warm)" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <p style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "16px",
          }}>
            {d.kicker}
          </p>
          <h1 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "48px",
            fontWeight: 300,
            letterSpacing: "-0.01em",
            margin: "0 0 24px 0",
            color: "var(--ink)",
          }}>
            {d.title}
          </h1>
          <p style={{
            fontSize: "18px",
            color: "var(--ink-2)",
            lineHeight: 1.6,
            margin: 0,
          }}>
            {d.subtitle}
          </p>
        </div>
      </section>

      {/* Problems solved */}
      <section style={{ padding: "64px 48px", background: "white" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "32px",
            fontWeight: 300,
            margin: "0 0 40px 0",
            textAlign: "center",
            color: "var(--ink)",
          }}>
            {d.problemsTitle}
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px",
          }}>
            {d.problems.map((item) => (
              <div key={item.title} style={{ padding: "24px", background: "var(--bg-warm)", borderRadius: "8px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 10px 0", color: "var(--ink)" }}>
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

      {/* Step by step tutorial */}
      <section style={{ padding: "64px 48px", background: "var(--bg-warm)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "32px",
            fontWeight: 300,
            margin: "0 0 56px 0",
            textAlign: "center",
            color: "var(--ink)",
          }}>
            {d.stepsTitle}
          </h2>

          {d.steps.map((item, index) => (
            <div
              key={item.step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "48px",
                marginBottom: index === d.steps.length - 1 ? 0 : "48px",
                flexDirection: index % 2 === 1 ? "row-reverse" : "row",
              }}
            >
              <div style={{ flex: "0 0 140px", display: "flex", justifyContent: "center" }}>
                <MaskedIllustration
                  src={STEP_IMAGES[index]}
                  alt={item.title}
                  size={140}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'IBM Plex Serif', serif",
                  fontSize: "56px",
                  fontWeight: 300,
                  color: "var(--blue-10)",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 600, margin: "0 0 12px 0", color: "var(--ink)" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "16px", color: "var(--ink-2)", lineHeight: 1.7, margin: "0 0 12px 0" }}>
                  {item.desc}
                </p>
                <p style={{ fontSize: "14px", color: "var(--blue-60)", margin: 0, fontWeight: 500 }}>
                  💡 {item.tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Output formats */}
      <section style={{ padding: "64px 48px", background: "white" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "32px",
            fontWeight: 300,
            margin: "0 0 40px 0",
            textAlign: "center",
            color: "var(--ink)",
          }}>
            {d.formatsTitle}
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "24px",
          }}>
            {d.formats.map((fmt) => (
              <div
                key={fmt.name}
                style={{
                  padding: "24px",
                  border: "1px solid var(--rule)",
                  borderRadius: "8px",
                }}
              >
                <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px 0", color: "var(--ink)" }}>
                  {fmt.name}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
                  {fmt.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "80px 48px",
        background: "var(--blue-90)",
        color: "white",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "36px",
            fontWeight: 300,
            margin: "0 0 16px 0",
          }}>
            {d.ctaTitle}
          </h2>
          <p style={{ fontSize: "16px", color: "var(--blue-20)", margin: "0 0 32px 0" }}>
            {d.ctaDesc}
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "14px 28px",
              background: "white",
              color: "var(--blue-90)",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            {d.ctaButton}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 48px", background: "var(--ink)", color: "#6f6f6f", fontSize: "13px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{d.footerCopyright}</span>
          <Link href="/" style={{ color: "#6f6f6f", textDecoration: "none" }}>
            {d.footerHome}
          </Link>
        </div>
      </footer>
    </main>
  )
}
