"use client"

import Link from "next/link"
import { useState } from "react"
import { useTranslation } from "@/components/LanguageProvider"
import { SiteNav } from "@/components/SiteNav"

function RichText({ k }: { k: string }) {
  const { t } = useTranslation()
  return <span dangerouslySetInnerHTML={{ __html: t(k) }} />
}

export default function DocsPage() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(key)
        setTimeout(() => setCopied(null), 1500)
      })
    }
  }

  const toc: Array<[string, string]> = [
    ["#quickstart", t("docs.toc.quickstart")],
    ["#formats", t("docs.toc.formats")],
    ["#evidence", t("docs.toc.evidence")],
    ["#audit", t("docs.toc.audit")],
    ["#api", t("docs.toc.api")],
    ["#faq", t("docs.toc.faq")],
  ]

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Nav */}
      <SiteNav variant="light" />

      {/* Header */}
      <header style={{
        padding: "80px 48px 48px",
        background: "linear-gradient(180deg, #f2f4f8 0%, white 100%)",
        borderBottom: "1px solid var(--rule)",
      }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ width: "48px", height: "4px", background: "var(--blue-60)", marginBottom: "24px" }} />
          <p style={{
            fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px",
          }}>{t("docs.eyebrow")}</p>
          <h1 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "52px", fontWeight: 300, letterSpacing: "-0.02em",
            margin: "0 0 20px 0",
          }}>{t("docs.title")}</h1>
          <p style={{ fontSize: "18px", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
            {t("docs.subtitle")}
          </p>
        </div>
      </header>

      {/* Content */}
      <section style={{ padding: "64px 48px", maxWidth: "1120px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "64px" }}>
          {/* Sidebar */}
          <aside style={{ position: "sticky", top: "80px", alignSelf: "start" }}>
            <p style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px",
            }}>{t("docs.onThisPage")}</p>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              {toc.map(([href, label]) => (
                <a key={href} href={href} style={{ color: "var(--ink-2)", textDecoration: "none", borderLeft: "2px solid var(--rule)", paddingLeft: "12px" }}>
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Articles */}
          <article style={{ color: "var(--ink-2)", lineHeight: 1.7, fontSize: "16px" }}>
            <DocSection id="quickstart" title={t("docs.quickstart.title")} kicker={t("docs.quickstart.kicker")}>
              <p dangerouslySetInnerHTML={{ __html: t("docs.quickstart.p1") }} />
              <CodeBlock
                language="text"
                code="github.com/owner/repository"
                onCopy={() => copy("github.com/owner/repository", "qs")}
                copied={copied === "qs"}
                copyLabel={t("docs.copy")}
                copiedLabel={t("docs.copied")}
              />
              <p dangerouslySetInnerHTML={{ __html: t("docs.quickstart.p2") }} />
            </DocSection>

            <DocSection id="formats" title={t("docs.formats.title")} kicker={t("docs.formats.kicker")}>
              <p dangerouslySetInnerHTML={{ __html: t("docs.formats.intro") }} />
              <ul style={{ paddingLeft: "20px", margin: "16px 0" }}>
                <li><RichText k="docs.formats.li1" /></li>
                <li><RichText k="docs.formats.li2" /></li>
                <li><RichText k="docs.formats.li3" /></li>
                <li><RichText k="docs.formats.li4" /></li>
              </ul>
            </DocSection>

            <DocSection id="evidence" title={t("docs.evidence.title")} kicker={t("docs.evidence.kicker")}>
              <p dangerouslySetInnerHTML={{ __html: t("docs.evidence.body") }} />
            </DocSection>

            <DocSection id="audit" title={t("docs.audit.title")} kicker={t("docs.audit.kicker")}>
              <p dangerouslySetInnerHTML={{ __html: t("docs.audit.body") }} />
            </DocSection>

            <DocSection id="api" title={t("docs.api.title")} kicker={t("docs.api.kicker")}>
              <p dangerouslySetInnerHTML={{ __html: t("docs.api.body") }} />
              <CodeBlock
                language="http"
                code={`POST /api/analyze
Content-Type: application/json

{ "repoUrl": "github.com/owner/repository" }`}
                onCopy={() => copy(`POST /api/analyze\nContent-Type: application/json\n\n{ "repoUrl": "github.com/owner/repository" }`, "api")}
                copied={copied === "api"}
                copyLabel={t("docs.copy")}
                copiedLabel={t("docs.copied")}
              />
            </DocSection>

            <DocSection id="faq" title={t("docs.faq.title")} kicker={t("docs.faq.kicker")}>
              <Faq q={t("docs.faq.q1")}>{t("docs.faq.a1")}</Faq>
              <Faq q={t("docs.faq.q2")}>{t("docs.faq.a2")}</Faq>
              <Faq q={t("docs.faq.q3")}>{t("docs.faq.a3")}</Faq>
            </DocSection>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0a0a0a", color: "white", padding: "48px", marginTop: "auto" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
          <span style={{ color: "#949494" }}>{t("docs.footerCopyright")}</span>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.home")}</Link>
            <Link href="/pricing" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.pricing")}</Link>
            <Link href="/login" style={{ color: "#949494", textDecoration: "none" }}>{t("nav.signIn")}</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

/* --- Local subcomponents used only by this page --- */

function DocSection({
  id, title, kicker, children,
}: { id: string; title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: "64px" }}>
      <p style={{
        fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px",
      }}>{kicker}</p>
      <h2 style={{
        fontFamily: "'IBM Plex Serif', Georgia, serif",
        fontSize: "32px", fontWeight: 400, letterSpacing: "-0.01em",
        color: "var(--ink)", margin: "0 0 20px 0",
      }}>{title}</h2>
      <div>{children}</div>
    </section>
  )
}

function CodeBlock({
  language, code, onCopy, copied, copyLabel, copiedLabel,
}: {
  language: string
  code: string
  onCopy: () => void
  copied: boolean
  copyLabel: string
  copiedLabel: string
}) {
  return (
    <div style={{
      position: "relative", margin: "20px 0",
      background: "#0e1420", borderRadius: "8px", overflow: "hidden",
      border: "1px solid #1f2a3a",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderBottom: "1px solid #1f2a3a",
        background: "#0a1020", color: "#7e8ba6", fontSize: "12px",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        <span>{language}</span>
        <button
          onClick={onCopy}
          style={{
            background: "transparent", border: "none", color: "#7e8ba6",
            cursor: "pointer", fontSize: "12px", padding: 0,
            fontFamily: "inherit",
          }}
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: "16px", color: "#c8d0dc",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "13px", lineHeight: 1.6, overflowX: "auto",
      }}>{code}</pre>
    </div>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--ink)", margin: "0 0 8px 0" }}>{q}</h3>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  )
}
