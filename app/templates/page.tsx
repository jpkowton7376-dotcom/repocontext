"use client"

import { useState } from "react"
import Link from "next/link"
import { SiteNav } from "@/components/SiteNav"
import { JsonLd } from "@/components/JsonLd"
import { useTranslation } from "@/components/LanguageProvider"
import { SAMPLES, PROMPTS, BEST_PRACTICES, UI } from "@/lib/templates"
import type { Locale } from "@/app/i18n/config"

type Tab = "samples" | "prompts" | "best"

function CodeBlock({
  code,
  copyLabel,
  copiedLabel,
}: {
  code: string
  copyLabel: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={onCopy}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 2,
          fontSize: "12px",
          padding: "5px 12px",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.18)",
          background: copied ? "#198038" : "rgba(15,98,254,0.85)",
          color: "white",
          cursor: "pointer",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {copied ? copiedLabel : copyLabel}
      </button>
      <pre
        style={{
          margin: 0,
          padding: "18px 18px",
          background: "#0d1117",
          color: "#e6edf3",
          borderRadius: "8px",
          overflowX: "auto",
          maxHeight: "420px",
          fontSize: "12.5px",
          lineHeight: 1.6,
          fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

function SectionBanner({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "200px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid var(--rule)",
        background: "linear-gradient(135deg, #eaf1ff 0%, #f6f9ff 100%)",
        marginBottom: "28px",
      }}
    >
      {/* Plain img keeps the decorative 3D render responsive without
          next/image domain config. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  )
}

export default function TemplatesPage() {
  const { t, locale } = useTranslation()
  const [tab, setTab] = useState<Tab>("samples")
  const L = locale as Locale

  const tabs: { id: Tab; label: string }[] = [
    { id: "samples", label: UI.tabSamples[L] },
    { id: "prompts", label: UI.tabPrompts[L] },
    { id: "best", label: UI.tabBest[L] },
  ]

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: UI.title[L],
          description: UI.subtitle[L],
          url: "https://repocontext.vercel.app/templates",
          isPartOf: { "@type": "WebSite", name: "RepoContext", url: "https://repocontext.vercel.app" },
        }}
      />

      <SiteNav variant="light" />

      {/* Hero */}
      <section
        style={{
          padding: "56px 48px 36px",
          textAlign: "center",
          background: "linear-gradient(180deg, #f6f8fb 0%, white 100%)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "14px",
          }}
        >
          {UI.eyebrow[L]}
        </p>
        <h1
          style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "44px",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            margin: "0 0 16px 0",
          }}
        >
          {UI.title[L]}
        </h1>
        <p
          style={{
            fontSize: "17px",
            color: "var(--ink-2)",
            lineHeight: 1.6,
            maxWidth: "720px",
            margin: "0 auto 28px",
          }}
        >
          {UI.subtitle[L]}
        </p>
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            height: "260px",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid var(--rule)",
            background: "linear-gradient(135deg, #eaf1ff 0%, #f3f7ff 100%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/templates/hero.png"
            alt={UI.title[L]}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </section>

      {/* Tabs */}
      <div
        style={{
          position: "sticky",
          top: "64px",
          zIndex: 50,
          background: "white",
          borderBottom: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          padding: "14px 16px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tb) => {
          const active = tab === tb.id
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              style={{
                padding: "9px 20px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                border: active ? "1px solid var(--blue-50)" : "1px solid var(--rule)",
                background: active ? "var(--blue-50)" : "white",
                color: active ? "white" : "var(--ink-2)",
                transition: "all .15s ease",
              }}
            >
              {tb.label}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <section
        style={{
          flex: 1,
          maxWidth: "1180px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 48px 96px",
          boxSizing: "border-box",
        }}
      >
        {/* ---------------- Sample library ---------------- */}
        <div style={{ display: tab === "samples" ? "block" : "none" }}>
          <SectionBanner src="/templates/samples.png" alt={UI.samplesTitle[L]} />
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {UI.samplesTitle[L]}
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              {UI.samplesSub[L]}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {SAMPLES.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)",
                  gap: "28px",
                  padding: "24px",
                  border: "1px solid var(--rule)",
                  borderRadius: "10px",
                  background: "white",
                  alignItems: "start",
                }}
                className="templates-sample-grid"
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: s.accent,
                        border: `1px solid ${s.accent}`,
                        padding: "3px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {s.format}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
                    {s.stack}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.6, margin: "0 0 14px" }}>
                    {s.desc[L]}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "12px",
                          color: "var(--muted-2)",
                          background: "var(--bg-cool)",
                          border: "1px solid var(--rule-2)",
                          padding: "3px 9px",
                          borderRadius: "999px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <CodeBlock code={s.code} copyLabel={UI.copy[L]} copiedLabel={UI.copied[L]} />
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- Prompt templates ---------------- */}
        <div style={{ display: tab === "prompts" ? "block" : "none" }}>
          <SectionBanner src="/templates/prompts.png" alt={UI.promptsTitle[L]} />
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {UI.promptsTitle[L]}
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              {UI.promptsSub[L]}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
              gap: "24px",
            }}
            className="templates-prompt-grid"
          >
            {PROMPTS.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  padding: "22px",
                  border: "1px solid var(--rule)",
                  borderRadius: "10px",
                  background: "white",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--blue-50)",
                      background: "var(--accent-light)",
                      padding: "3px 9px",
                      borderRadius: "4px",
                    }}
                  >
                    {p.badge}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--muted-2)", fontStyle: "italic" }}>
                    {UI.useCase[L]}: {p.useCase[L]}
                  </span>
                </div>
                <CodeBlock code={p.prompt} copyLabel={UI.copy[L]} copiedLabel={UI.copied[L]} />
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                    borderLeft: "3px solid var(--blue-30)",
                    paddingLeft: "12px",
                    background: "var(--bg-cool)",
                    padding: "10px 12px",
                    borderRadius: "0 6px 6px 0",
                  }}
                >
                  <strong style={{ color: "var(--blue-70)" }}>{UI.note[L]}:</strong> {p.note[L]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- Best practices ---------------- */}
        <div style={{ display: tab === "best" ? "block" : "none" }}>
          <SectionBanner src="/templates/bestpractices.png" alt={UI.bestTitle[L]} />
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {UI.bestTitle[L]}
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              {UI.bestSub[L]}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}
            className="templates-best-grid"
          >
            {BEST_PRACTICES.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  padding: "24px",
                  border: "1px solid var(--rule)",
                  borderRadius: "10px",
                  background: "white",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
                  {b.title[L]}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                  {b.desc[L]}
                </p>
                <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-2)", marginTop: "4px" }}>
                  {UI.tips[L]}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {b.tips.map((tip, i) => (
                    <li key={i} style={{ display: "flex", gap: "10px", fontSize: "14px", lineHeight: 1.55, color: "var(--ink-2)" }}>
                      <span style={{ color: "var(--green-50)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span>{tip[L]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "var(--blue-90)",
          color: "white",
          padding: "56px 48px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: "30px", fontWeight: 300, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
          {UI.ctaTitle[L]}
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", maxWidth: "560px", margin: "0 auto 24px", lineHeight: 1.6 }}>
          {UI.ctaBody[L]}
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "white",
            color: "var(--blue-90)",
            padding: "12px 26px",
            fontSize: "15px",
            fontWeight: 600,
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          {UI.ctaButton[L]}
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--rule)", padding: "32px 48px", background: "white" }}>
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            fontSize: "13px",
            color: "var(--muted-2)",
          }}
        >
          <span>© {new Date().getFullYear()} RepoContext</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/pricing" style={{ color: "var(--muted-2)", textDecoration: "none" }}>
              {t("nav.pricing")}
            </Link>
            <Link href="/docs" style={{ color: "var(--muted-2)", textDecoration: "none" }}>
              {t("nav.docs")}
            </Link>
            <Link href="/terms" style={{ color: "var(--muted-2)", textDecoration: "none" }}>
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
