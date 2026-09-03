"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(key)
        setTimeout(() => setCopied(null), 1500)
      })
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Nav */}
      <nav style={{
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
        <div style={{ display: "flex", alignItems: "center", gap: "32px", fontSize: "14px" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Features</Link>
          <Link href="/pricing" style={{ color: "var(--muted)", textDecoration: "none" }}>Pricing</Link>
          <span style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "none" }}>Documentation</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
          }}>Documentation</p>
          <h1 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "52px", fontWeight: 300, letterSpacing: "-0.02em",
            margin: "0 0 20px 0",
          }}>Everything you need to ship AI-ready context.</h1>
          <p style={{ fontSize: "18px", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
            Learn how to use RepoContext to turn your GitHub repositories into accurate, structured documentation for AI coding agents.
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
            }}>On this page</p>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              {[
                ["#quickstart", "Quick start"],
                ["#formats", "Supported formats"],
                ["#evidence", "Evidence panel"],
                ["#audit", "AGENTS.md audit"],
                ["#api", "API reference"],
                ["#faq", "FAQ"],
              ].map(([href, label]) => (
                <a key={href} href={href} style={{ color: "var(--ink-2)", textDecoration: "none", borderLeft: "2px solid var(--rule)", paddingLeft: "12px" }}>
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Articles */}
          <article style={{ color: "var(--ink-2)", lineHeight: 1.7, fontSize: "16px" }}>
            <DocSection id="quickstart" title="Quick start" kicker="Get up and running in 60 seconds.">
              <p>
                Paste any public GitHub repository URL into the homepage and click <strong>Analyze</strong>.
                Within seconds, RepoContext scans your repository and produces structured documentation
                that AI coding agents can use as reliable context.
              </p>
              <CodeBlock
                language="text"
                code="github.com/owner/repository"
                onCopy={() => copy("github.com/owner/repository", "qs")}
                copied={copied === "qs"}
              />
              <p>
                The output includes a framework detection summary, dependency graph, build/test setup,
                and a quality score so you know how much you can trust the result.
              </p>
            </DocSection>

            <DocSection id="formats" title="Supported formats" kicker="Export once, use everywhere.">
              <p>All plans include the canonical <code>AGENTS.md</code> export. Pro and Team unlock the rest:</p>
              <ul style={{ paddingLeft: "20px", margin: "16px 0" }}>
                <li><strong>AGENTS.md</strong> — the cross-tool standard for agent instructions.</li>
                <li><strong>CLAUDE.md</strong> — Claude-optimized prompt context.</li>
                <li><strong>Cursor Rules</strong> — <code>.cursorrules</code> for Cursor IDE.</li>
                <li><strong>Copilot Instructions</strong> — repository-level GitHub Copilot guidance.</li>
              </ul>
            </DocSection>

            <DocSection id="evidence" title="Evidence panel" kicker="Every claim is traceable.">
              <p>
                For each piece of generated documentation, RepoContext shows which files and config artifacts
                it was derived from. Click any statement to inspect the underlying evidence — no more
                guessing where a recommendation came from.
              </p>
            </DocSection>

            <DocSection id="audit" title="AGENTS.md audit" kicker="Already have a file? We'll grade it.">
              <p>
                Upload an existing <code>AGENTS.md</code> and we'll audit it for accuracy, completeness,
                and staleness. You'll see a quality score plus a checklist of concrete fixes you can apply.
              </p>
            </DocSection>

            <DocSection id="api" title="API reference" kicker="For teams & automation.">
              <p>
                The same engine powers a JSON API. Send a repository URL and receive structured results
                you can pipe into your CI pipeline.
              </p>
              <CodeBlock
                language="http"
                code={`POST /api/analyze
Content-Type: application/json

{ "repoUrl": "github.com/owner/repository" }`}
                onCopy={() => copy(`POST /api/analyze\nContent-Type: application/json\n\n{ "repoUrl": "github.com/owner/repository" }`, "api")}
                copied={copied === "api"}
              />
            </DocSection>

            <DocSection id="faq" title="FAQ" kicker="Common questions.">
              <Faq q="Is my code uploaded to your servers?">
                RepoContext only reads what it needs from the GitHub API. The full source tree is never
                written to disk on our side, and you can delete the cached metadata at any time from
                the dashboard.
              </Faq>
              <Faq q="Can I analyze private repositories?">
                Yes — Pro and Team plans support private repos via OAuth. Your code never leaves
                your control; we only read metadata, not file contents, by default.
              </Faq>
              <Faq q="How accurate is the output?">
                Every analysis ships with a quality score. Files with low confidence are flagged
                in the evidence panel so you know exactly where to double-check.
              </Faq>
            </DocSection>
          </article>
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
  language, code, onCopy, copied,
}: { language: string; code: string; onCopy: () => void; copied: boolean }) {
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
          {copied ? "Copied ✓" : "Copy"}
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