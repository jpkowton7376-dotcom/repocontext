"use client"

import Link from "next/link"
import Image from "next/image"

export default function ChangelogPage() {
  const releases = [
    {
      date: "September 2, 2026",
      tag: "New",
      title: "Multi-format export is here",
      summary:
        "Generate documentation in four formats from a single analysis: AGENTS.md, CLAUDE.md, Cursor Rules, and Copilot Instructions.",
      items: [
        { kind: "added", text: "Export to AGENTS.md, CLAUDE.md, Cursor Rules, and GitHub Copilot Instructions" },
        { kind: "added", text: "Format-specific fine-tuning so each export is idiomatic to its target" },
        { kind: "improved", text: "Re-runs of an analysis now produce byte-stable output" },
      ],
    },
    {
      date: "August 19, 2026",
      tag: "Improvement",
      title: "Evidence panel & AGENTS.md Audit",
      summary:
        "Every claim is now traceable to the source file that produced it, and existing AGENTS.md files can be audited for accuracy and freshness.",
      items: [
        { kind: "added", text: "Evidence panel showing the exact file behind every generated statement" },
        { kind: "added", text: "AGENTS.md audit with a quality score and a checklist of concrete fixes" },
        { kind: "fixed", text: "False-positive detection of monorepo workspaces" },
      ],
    },
    {
      date: "August 5, 2026",
      tag: "Improvement",
      title: "Private repository support & dashboard",
      summary:
        "Connect private GitHub repositories securely. Your code never leaves your control.",
      items: [
        { kind: "added", text: "GitHub OAuth for private repositories" },
        { kind: "added", text: "Dashboard with analysis history and quality trends" },
        { kind: "improved", text: "Scan latency reduced by ~40% for large repositories" },
      ],
    },
    {
      date: "July 21, 2026",
      tag: "Launch",
      title: "RepoContext public beta",
      summary:
        "RepoContext is live. Paste any GitHub URL and get accurate, structured documentation for AI coding agents in seconds.",
      items: [
        { kind: "added", text: "Public repository analysis with intelligent framework detection" },
        { kind: "added", text: "Quality score so you know how much you can trust the result" },
      ],
    },
  ]

  const tagColor: Record<string, { bg: string; fg: string }> = {
    New: { bg: "rgba(64, 128, 255, 0.12)", fg: "#1d4ed8" },
    Improvement: { bg: "rgba(34, 197, 94, 0.14)", fg: "#15803d" },
    Launch: { bg: "rgba(234, 179, 8, 0.18)", fg: "#a16207" },
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Nav */}
      <nav className="rc-page-header" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: "64px",
        borderBottom: "1px solid var(--rule)",
        background: "white", position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
          <div style={{ width: "36px", height: "36px", position: "relative" }}>
            <Image src="/logo-dark.png" alt="RepoContext" fill sizes="36px"
              style={{ objectFit: "contain", backgroundColor: "transparent" }} priority quality={95} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>RepoContext</span>
        </Link>
        <div className="rc-page-header-group" style={{ display: "flex", alignItems: "center", gap: "32px", fontSize: "14px" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Features</Link>
          <Link href="/pricing" style={{ color: "var(--muted)", textDecoration: "none" }}>Pricing</Link>
          <Link href="/docs" style={{ color: "var(--muted)", textDecoration: "none" }}>Documentation</Link>
        </div>
        <div className="rc-page-header-group" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/login" style={{ fontSize: "14px", color: "var(--ink)", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          <Link href="/pricing" style={{
            fontSize: "14px", padding: "10px 20px",
            background: "var(--blue-60)", color: "white",
            textDecoration: "none", fontWeight: 500, letterSpacing: "0.02em",
          }}>Get started</Link>
        </div>
      </nav>

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
          }}>Changelog</p>
          <h1 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "52px", fontWeight: 300, letterSpacing: "-0.02em",
            margin: "0 0 20px 0",
          }}>What's new in RepoContext</h1>
          <p style={{ fontSize: "18px", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
            Every release, improvement, and fix. We ship continuously and post notes here so you always know what changed.
          </p>
        </div>
      </header>

      {/* Releases */}
      <section style={{ padding: "64px 48px 96px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>
          {releases.map((rel, idx) => {
            const tc = tagColor[rel.tag] ?? { bg: "rgba(0,0,0,0.08)", fg: "var(--ink)" }
            return (
              <article key={idx} style={{
                border: "1px solid var(--rule)",
                background: "white",
                padding: "32px",
                borderRadius: "4px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", padding: "4px 10px",
                    background: tc.bg, color: tc.fg, borderRadius: "3px",
                  }}>{rel.tag}</span>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>{rel.date}</span>
                </div>
                <h2 style={{
                  fontFamily: "'IBM Plex Serif', Georgia, serif",
                  fontSize: "26px", fontWeight: 400, letterSpacing: "-0.01em",
                  color: "var(--ink)", margin: "0 0 12px 0",
                }}>{rel.title}</h2>
                <p style={{ fontSize: "16px", color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                  {rel.summary}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {rel.items.map((it, i) => {
                    const dot =
                      it.kind === "added" ? "#22c55e" :
                      it.kind === "improved" ? "#3b82f6" :
                      it.kind === "fixed" ? "#facc15" : "var(--muted)"
                    return (
                      <li key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: "12px",
                        fontSize: "14px", color: "var(--ink-2)", lineHeight: 1.5,
                      }}>
                        <span style={{
                          width: "8px", height: "8px", borderRadius: "50%",
                          background: dot, marginTop: "7px", flexShrink: 0,
                        }} />
                        <span>{it.text}</span>
                      </li>
                    )
                  })}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0a0a0a", color: "white", padding: "48px", marginTop: "auto" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
          <span style={{ color: "#949494" }}>© 2026 RepoContext. All rights reserved.</span>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/" style={{ color: "#949494", textDecoration: "none" }}>Home</Link>
            <Link href="/pricing" style={{ color: "#949494", textDecoration: "none" }}>Pricing</Link>
            <Link href="/login" style={{ color: "#949494", textDecoration: "none" }}>Sign in</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}