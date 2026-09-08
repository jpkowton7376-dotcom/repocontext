"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useTranslation } from "@/components/LanguageProvider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

/* ---------- Illustrations (inline SVG, no external assets) ---------- */

function BrowserMock({ url, children }: { url: string; children?: ReactNode }) {
  return (
    <svg viewBox="0 0 360 220" width="100%" role="img" aria-label="Illustration" style={{ display: "block" }}>
      <rect x="0.75" y="0.75" width="358.5" height="218.5" rx="14" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1.5" />
      <path d="M14 0 H346 A14 14 0 0 1 360 14 V42 H0 V14 A14 14 0 0 1 14 0 Z" fill="#f4f4f4" />
      <circle cx="16" cy="21" r="3.5" fill="#ff5f57" />
      <circle cx="28" cy="21" r="3.5" fill="#febc2e" />
      <circle cx="40" cy="21" r="3.5" fill="#28c840" />
      <rect x="50" y="10" width="300" height="22" rx="6" fill="#ffffff" stroke="#d0d0d0" />
      <text x="60" y="25" fontFamily="'IBM Plex Mono', monospace" fontSize="10.5" fill="#3d3d3d">{url}</text>
      {children}
    </svg>
  )
}

function IlluOpenRepo() {
  return (
    <BrowserMock url="github.com/psf/requests">
      <rect x="0" y="42" width="360" height="34" fill="#0d1117" />
      <circle cx="20" cy="59" r="9" fill="#ffffff" opacity="0.9" />
      <text x="38" y="63" fontFamily="sans-serif" fontSize="13" fontWeight={600} fill="#ffffff">psf</text>
      <text x="62" y="63" fontFamily="sans-serif" fontSize="13" fill="#8b949e">/ requests</text>
      <rect x="276" y="50" width="72" height="20" rx="5" fill="#238636" />
      <text x="290" y="64" fontFamily="sans-serif" fontSize="10" fill="#ffffff">Code ▾</text>
      <rect x="20" y="94" width="200" height="10" rx="3" fill="#e6e6e6" />
      <rect x="20" y="114" width="320" height="8" rx="3" fill="#efefef" />
      <rect x="20" y="130" width="300" height="8" rx="3" fill="#efefef" />
      <rect x="20" y="146" width="320" height="8" rx="3" fill="#efefef" />
      <rect x="20" y="162" width="230" height="8" rx="3" fill="#efefef" />
      <rect x="20" y="184" width="260" height="8" rx="3" fill="#efefef" />
    </BrowserMock>
  )
}

function IlluCopy() {
  return (
    <BrowserMock url="https://github.com/psf/requests">
      <rect x="48" y="8" width="304" height="26" rx="7" fill="none" stroke="#0043ce" strokeWidth="2.5" />
      <rect x="250" y="118" width="92" height="34" rx="8" fill="#0043ce" />
      <text x="270" y="140" fontFamily="sans-serif" fontSize="13" fill="#ffffff">Copy</text>
      <rect x="40" y="170" width="118" height="28" rx="6" fill="#f4f4f4" stroke="#e0e0e0" />
      <text x="56" y="188" fontFamily="'IBM Plex Mono', monospace" fontSize="11" fill="#3d3d3d">Ctrl+C</text>
      <text x="176" y="188" fontFamily="sans-serif" fontSize="11" fill="#6f6f6f">or Cmd+C</text>
    </BrowserMock>
  )
}

function IlluRoot() {
  return (
    <BrowserMock url="github.com/psf/requests">
      <rect x="20" y="62" width="320" height="34" rx="8" fill="#eafaf0" stroke="#198038" />
      <text x="34" y="84" fontFamily="'IBM Plex Mono', monospace" fontSize="11" fill="#198038">✓ https://github.com/psf/requests</text>
      <rect x="20" y="112" width="320" height="34" rx="8" fill="#fdeaea" stroke="#d13438" />
      <text x="34" y="134" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fill="#d13438">✗ …/requests/blob/main/api.py</text>
      <text x="20" y="180" fontFamily="sans-serif" fontSize="11" fill="#6f6f6f">Go up to the repo root before copying.</text>
    </BrowserMock>
  )
}

function IlluBranch() {
  return (
    <BrowserMock url="https://github.com/owner/repo">
      <text x="20" y="84" fontFamily="'IBM Plex Mono', monospace" fontSize="12" fill="#3d3d3d">https://github.com/owner/repo</text>
      <text x="20" y="116" fontFamily="'IBM Plex Mono', monospace" fontSize="13" fontWeight={700} fill="#0043ce">+ /tree/develop</text>
      <rect x="20" y="134" width="180" height="28" rx="14" fill="#eaf0ff" stroke="#0043ce" />
      <text x="34" y="153" fontFamily="sans-serif" fontSize="11" fill="#0043ce">↳ branch: develop</text>
      <text x="20" y="192" fontFamily="sans-serif" fontSize="11" fill="#6f6f6f">Optional — defaults to the default branch.</text>
    </BrowserMock>
  )
}

function IlluPaste() {
  return (
    <BrowserMock url="repocontext.vercel.app">
      <rect x="20" y="70" width="244" height="40" rx="8" fill="#0e1420" stroke="#5c9aff" />
      <text x="34" y="95" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fill="#ffffff">https://github.com/psf/requests</text>
      <rect x="272" y="70" width="68" height="40" rx="8" fill="#2f6bff" />
      <text x="285" y="95" fontFamily="sans-serif" fontSize="12" fill="#ffffff">Analyze</text>
      <text x="20" y="150" fontFamily="sans-serif" fontSize="12" fill="#6f6f6f">Paste the link and click Analyze →</text>
      <text x="20" y="178" fontFamily="sans-serif" fontSize="11" fill="#9aa3b2">Get AI-ready context in seconds.</text>
    </BrowserMock>
  )
}

export default function GetRepoLinkPage() {
  const { t, dict } = useTranslation()
  const gl = dict.getRepoLink

  const illus = [<IlluOpenRepo key="1" />, <IlluCopy key="2" />, <IlluRoot key="3" />, <IlluBranch key="4" />, <IlluPaste key="5" />]

  const steps = gl.steps.map((s, i) => ({
    step: String(i + 1).padStart(2, "0"),
    title: s.title,
    desc: s.desc,
    tip: s.tip,
    illu: illus[i],
  }))

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
          <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)" }}>
            RepoContext
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <LanguageSwitcher />
          <Link
            href="/"
            style={{
              fontSize: "14px",
              color: "var(--blue-60)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {gl.back}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "80px 48px 48px", background: "var(--bg-warm)" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <p style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "16px",
          }}>
            {gl.eyebrow}
          </p>
          <h1 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "48px",
            fontWeight: 300,
            letterSpacing: "-0.01em",
            margin: "0 0 24px 0",
            color: "var(--ink)",
          }}>
            {gl.title}
          </h1>
          <p style={{
            fontSize: "18px",
            color: "var(--ink-2)",
            lineHeight: 1.6,
            margin: 0,
          }}>
            {gl.intro}{" "}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--blue-60)" }}>
              {gl.introUrl}
            </span>
            {gl.introSuffix}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: "64px 48px 32px", background: "white" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="step-card"
              style={{
                paddingBottom: index === steps.length - 1 ? 0 : "40px",
                borderBottom: index === steps.length - 1 ? "none" : "1px solid var(--rule-2)",
                marginBottom: index === steps.length - 1 ? 0 : "40px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'IBM Plex Serif', serif",
                    fontSize: "40px",
                    fontWeight: 300,
                    color: "var(--blue-10)",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 12px 0", color: "var(--ink)" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "16px", color: "var(--ink-2)", lineHeight: 1.7, margin: "0 0 12px 0" }}>
                    {item.desc}
                  </p>
                  <p style={{ fontSize: "14px", color: "var(--blue-60)", margin: 0, fontWeight: 500 }}>
                    ✓ {item.tip}
                  </p>
                </div>
              </div>
              <div className="step-illu">
                {item.illu}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Example */}
      <section style={{ padding: "48px 48px 64px", background: "var(--bg-warm)" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "28px",
            fontWeight: 300,
            margin: "0 0 24px 0",
            color: "var(--ink)",
          }}>
            {gl.examplesTitle}
          </h2>
          <div style={{
            display: "inline-block",
            textAlign: "left",
            background: "white",
            border: "1px solid var(--rule)",
            padding: "20px 28px",
            borderRadius: "8px",
          }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "https://github.com/psf/requests",
                "https://github.com/vercel/next.js",
                "https://github.com/gin-gonic/gin",
              ].map((url) => (
                <li key={url} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "15px",
                  padding: "8px 0",
                  color: "var(--ink)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  <span style={{ color: "var(--green-50)", fontWeight: 700 }}>✓</span>
                  <span>{url}</span>
                </li>
              ))}
            </ul>
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
            {gl.ctaTitle}
          </h2>
          <p style={{ fontSize: "16px", color: "var(--blue-20)", margin: "0 0 32px 0" }}>
            {gl.ctaBody}
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
            {gl.ctaButton}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 48px", background: "var(--ink)", color: "#6f6f6f", fontSize: "13px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{t("footer.copyright")}</span>
          <Link href="/" style={{ color: "#6f6f6f", textDecoration: "none" }}>
            {gl.back}
          </Link>
        </div>
      </footer>
    </main>
  )
}
