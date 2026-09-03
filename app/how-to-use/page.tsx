import Link from "next/link"
import Image from "next/image"
import { MaskedIllustration } from "@/components/MaskedIllustration"

export const metadata = {
  title: "How to use RepoContext",
  description: "Learn how to turn any GitHub repository into AI-ready context with RepoContext.",
}

export default function HowToUsePage() {
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
        <Link
          href="/"
          style={{
            fontSize: "14px",
            color: "var(--blue-60)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          ← Back to home
        </Link>
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
            How to use
          </p>
          <h1 style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "48px",
            fontWeight: 300,
            letterSpacing: "-0.01em",
            margin: "0 0 24px 0",
            color: "var(--ink)",
          }}>
            Turn your codebase into AI-ready context.
          </h1>
          <p style={{
            fontSize: "18px",
            color: "var(--ink-2)",
            lineHeight: 1.6,
            margin: 0,
          }}>
            RepoContext analyzes your GitHub repositories and generates accurate, structured documentation
            for AI coding agents. No setup, no installation.
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
            What problems does it solve?
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px",
          }}>
            {[
              {
                title: "AI hallucinations",
                desc: "LLMs guess your project structure. RepoContext gives them the real structure, dependencies, and conventions.",
              },
              {
                title: "Manual documentation",
                desc: "Writing AGENTS.md or Cursor Rules by hand takes hours. RepoContext generates them in seconds.",
              },
              {
                title: "Inconsistent formats",
                desc: "Different AI tools need different formats. Export to AGENTS.md, CLAUDE.md, Cursor Rules, or Copilot Instructions.",
              },
            ].map((item) => (
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
            Step by step tutorial
          </h2>

          {[
            {
              step: "01",
              title: "Copy your GitHub repository URL",
              desc: "Open the public GitHub repository you want to analyze. Copy the URL from your browser address bar. It should look like github.com/owner/repository. Private repos are supported when you connect your GitHub account.",
              tip: "Example: psf/requests, vercel/next.js, gin-gonic/gin",
              illustration: (
                <MaskedIllustration
                  src="/illustrations/how-to-use/step01-url.png"
                  alt="Copy your GitHub repository URL"
                  size={140}
                />
              ),
            },
            {
              step: "02",
              title: "Paste it into RepoContext",
              desc: "Go back to the RepoContext homepage, paste the URL into the input field, and click Analyze. The engine will fetch the repository metadata and start scanning.",
              tip: "No credit card or configuration file is needed for public repos.",
              illustration: (
                <MaskedIllustration
                  src="/illustrations/how-to-use/step02-paste.png"
                  alt="Paste it into RepoContext"
                  size={140}
                />
              ),
            },
            {
              step: "03",
              title: "Wait for AI analysis",
              desc: "RepoContext detects frameworks, package managers, build tools, CI/CD pipelines, test setups, and directory conventions. Every insight is linked to the actual files used as evidence.",
              tip: "Analysis usually takes a few seconds, depending on repository size.",
              illustration: (
                <MaskedIllustration
                  src="/illustrations/how-to-use/step03-analysis.png"
                  alt="Wait for AI analysis"
                  size={140}
                />
              ),
            },
            {
              step: "04",
              title: "Review the quality score",
              desc: "Each report includes a quality score that tells you how reliable the generated context is. A higher score means the AI has more evidence and fewer uncertain guesses.",
              tip: "Look for the evidence list to see which files influenced each insight.",
              illustration: (
                <MaskedIllustration
                  src="/illustrations/how-to-use/step04-quality.png"
                  alt="Review the quality score"
                  size={140}
                />
              ),
            },
            {
              step: "05",
              title: "Export and integrate",
              desc: "Choose your preferred format and download the file. Drop it into Cursor, Claude Code, GitHub Copilot, or any AI coding agent that reads project context.",
              tip: "Supported formats: AGENTS.md, CLAUDE.md, Cursor Rules, Copilot Instructions.",
              illustration: (
                <MaskedIllustration
                  src="/illustrations/how-to-use/step05-export.png"
                  alt="Export and integrate"
                  size={140}
                />
              ),
            },
          ].map((item, index) => (
            <div
              key={item.step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "48px",
                marginBottom: index === 4 ? 0 : "48px",
                flexDirection: index % 2 === 1 ? "row-reverse" : "row",
              }}
            >
              <div style={{ flex: "0 0 140px", display: "flex", justifyContent: "center" }}>
                {item.illustration}
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
            Export formats
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "24px",
          }}>
            {[
              { name: "AGENTS.md", desc: "A comprehensive project brief for autonomous coding agents." },
              { name: "CLAUDE.md", desc: "Optimized for Claude Code and Anthropic-powered workflows." },
              { name: "Cursor Rules", desc: "Cursor-specific rules that shape completions and chat behavior." },
              { name: "Copilot Instructions", desc: "Instructions tailored for GitHub Copilot context." },
            ].map((fmt) => (
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
            Ready to try it?
          </h2>
          <p style={{ fontSize: "16px", color: "var(--blue-20)", margin: "0 0 32px 0" }}>
            Analyze your first repository in seconds. No credit card required.
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
            Start analyzing →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 48px", background: "var(--ink)", color: "#6f6f6f", fontSize: "13px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>© 2026 RepoContext. All rights reserved.</span>
          <Link href="/" style={{ color: "#6f6f6f", textDecoration: "none" }}>
            Back to home
          </Link>
        </div>
      </footer>
    </main>
  )
}
