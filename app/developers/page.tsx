"use client"

import Link from "next/link"
import { useState } from "react"
import { SiteNav } from "@/components/SiteNav"
import { SITE_URL } from "@/lib/site-url"

function CodeBlock({ children, copyKey }: { children: string; copyKey: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(children).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
    }
  }
  return (
    <div style={{ position: "relative" }}>
      <pre style={{
        background: "#0f172a",
        color: "#e2e8f0",
        padding: "16px 18px",
        overflow: "auto",
        fontSize: "13px",
        lineHeight: 1.6,
        margin: 0,
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          padding: "4px 10px",
          background: "rgba(255,255,255,0.08)",
          color: "#e2e8f0",
          border: "1px solid rgba(255,255,255,0.15)",
          fontSize: "11px",
          cursor: "pointer",
          letterSpacing: "0.04em",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}

export default function DevelopersPage() {
  const apiUrl = `${SITE_URL}/api/v1/analyze`
  const exampleCurl = `curl -X POST ${apiUrl} \\
  -H "Authorization: Bearer rc_live_xxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"repoUrl":"https://github.com/octocat/Hello-World"}'`

  const exampleResponse = `{
  "repo": { "fullName": "octocat/Hello-World", "stars": 1234, ... },
  "facts": { "framework": "Rails", "packageManager": "bundler", ... },
  "formats": {
    "agentsMd": "# AGENTS.md\\n...",
    "claudeMd": "# CLAUDE.md\\n...",
    "cursorRules": "...",
    "copilotInstructions": "..."
  },
  "quality": { "score": 87, "breakdown": { ... } },
  "audit": [ ... ],
  "evidence": [ ... ],
  "agentsMd": "# AGENTS.md\\n...",
  "usedLLM": true,
  "meta": { "apiKey": { "id": "...", "prefix": "rc_live_aB3x" }, "plan": "pro" }
}`

  const exampleJs = `import { RepoContext } from "@repocontext/sdk"; // coming soon
// or use the raw HTTP client
const res = await fetch("${SITE_URL}/api/v1/analyze", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.REPOCONTEXT_API_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ repoUrl: "https://github.com/octocat/Hello-World" })
});
const analysis = await res.json();
console.log(analysis.agentsMd); // write to AGENTS.md`

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      <SiteNav />

      <div style={{ flex: 1, maxWidth: "880px", margin: "0 auto", width: "100%", padding: "48px 24px 64px" }}>
        <div style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--blue-70)",
          marginBottom: "14px",
        }}>
          Public API
        </div>
        <h1 style={{
          fontFamily: "'IBM Plex Serif', Georgia, serif",
          fontSize: "44px",
          fontWeight: 300,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          color: "var(--ink)",
          margin: "0 0 16px 0",
        }}>
          RepoContext for CI bots and IDE plugins
        </h1>
        <p style={{ fontSize: "17px", lineHeight: 1.6, color: "var(--ink-2)", margin: "0 0 40px 0" }}>
          A single HTTP endpoint that turns any GitHub repository into a
          high-quality <code style={{ fontFamily: "'IBM Plex Mono', monospace", background: "var(--bg-cool)", padding: "1px 6px", borderRadius: "3px" }}>AGENTS.md</code> /
          <code style={{ fontFamily: "'IBM Plex Mono', monospace", background: "var(--bg-cool)", padding: "1px 6px", borderRadius: "3px" }}>CLAUDE.md</code> /
          Cursor rules / Copilot instructions pack. Same pipeline as the
          web app, accessible from any language that speaks HTTPS.
        </p>

        <section style={{ marginBottom: "48px" }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            margin: "0 0 16px 0",
            color: "var(--ink)",
          }}>
            Getting an API key
          </h2>
          <ol style={{ paddingLeft: "20px", lineHeight: 1.7, fontSize: "15px", color: "var(--ink-2)" }}>
            <li>Sign in to <Link href="/dashboard" style={{ color: "var(--blue-60)" }}>your dashboard</Link>.</li>
            <li>Scroll to the <strong>Developer API</strong> section and click <strong>Create new key</strong>.</li>
            <li>Save the plaintext key — it is shown only once.</li>
            <li>Store it as a secret (e.g. <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>REPOCONTEXT_API_KEY</code>) in your CI / shell environment.</li>
          </ol>
        </section>

        <section style={{ marginBottom: "48px" }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            margin: "0 0 16px 0",
            color: "var(--ink)",
          }}>
            <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "20px" }}>POST /api/v1/analyze</code>
          </h2>

          <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 8px 0", color: "var(--ink)" }}>Headers</h3>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.7, fontSize: "14px", color: "var(--ink-2)", marginBottom: "24px" }}>
            <li><code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Authorization: Bearer rc_live_…</code> — required</li>
            <li><code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Content-Type: application/json</code> — required</li>
          </ul>

          <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 8px 0", color: "var(--ink)" }}>Body</h3>
          <CodeBlock copyKey="body">{`{
  "repoUrl": "https://github.com/<owner>/<repo>"
}`}</CodeBlock>

          <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "24px 0 8px 0", color: "var(--ink)" }}>Example: curl</h3>
          <CodeBlock copyKey="curl">{exampleCurl}</CodeBlock>

          <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "24px 0 8px 0", color: "var(--ink)" }}>Example: JavaScript / fetch</h3>
          <CodeBlock copyKey="js">{exampleJs}</CodeBlock>

          <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "24px 0 8px 0", color: "var(--ink)" }}>Response (truncated)</h3>
          <CodeBlock copyKey="resp">{exampleResponse}</CodeBlock>
        </section>

        <section style={{ marginBottom: "48px" }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            margin: "0 0 16px 0",
            color: "var(--ink)",
          }}>
            Errors
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600 }}>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {[
                [401, "Missing, malformed, or revoked API key."],
                [400, "Body did not include { repoUrl: string }."],
                [402, "Free tier exhausted for this account — upgrade to continue."],
                [429, "Per-minute rate limit for this key exceeded. Wait for Retry-After, then retry."],
                [503, "Server not configured (Supabase/GitHub credentials missing)."],
                [500, "Upstream failure (GitHub unavailable, scanner error)."],
              ].map(([code, msg]) => (
                <tr key={code} style={{ borderBottom: "1px solid var(--rule-2)" }}>
                  <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono', monospace", color: "var(--ink)" }}>{code}</td>
                  <td style={{ padding: "10px 12px", color: "var(--ink-2)" }}>{msg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: "48px" }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            margin: "0 0 16px 0",
            color: "var(--ink)",
          }}>
            Limits and quotas
          </h2>
          <p style={{ fontSize: "15px", color: "var(--ink-2)", lineHeight: 1.7, margin: "0 0 12px 0" }}>
            Every API key carries a per-minute rate limit (default 30
            requests/min), and it is enforced: the 31st request in a minute
            returns <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>429</code> with a
            {" "}<code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Retry-After</code> header.
            Successful responses carry{" "}
            <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>X-RateLimit-Limit</code>,{" "}
            <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>X-RateLimit-Remaining</code> and{" "}
            <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>X-RateLimit-Reset</code>; the same numbers are in{" "}
            <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>meta.rateLimit</code>.
            Keys on Pro and Team plans will get higher limits as we ship
            tiered quotas.
          </p>
          <p style={{ fontSize: "15px", color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            API calls count against your normal plan quota (5 free / month
            for free accounts, unlimited on paid plans). They are
            persisted to your analysis history like web analyses, so you
            can review them in the dashboard.
          </p>
        </section>

        <section>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            margin: "0 0 16px 0",
            color: "var(--ink)",
          }}>
            Security
          </h2>
          <ul style={{ paddingLeft: "20px", lineHeight: 1.7, fontSize: "15px", color: "var(--ink-2)" }}>
            <li>Keys are stored as SHA-256 hashes — we never have the plaintext after creation.</li>
            <li>Revoking a key is instant and idempotent.</li>
            <li>All requests require HTTPS.</li>
            <li>You can have at most 5 active keys per account.</li>
          </ul>
        </section>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: "auto",
        background: "#111",
        color: "#949494",
        padding: "32px 24px",
        textAlign: "center",
        fontSize: "13px",
      }}>
        <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>RepoContext</Link>
        {" · "}
        Questions? Email <a href="mailto:jpkowton@gmail.com" style={{ color: "white" }}>jpkowton@gmail.com</a>
      </footer>
    </main>
  )
}