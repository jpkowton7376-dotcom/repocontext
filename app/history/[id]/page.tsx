"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/** One of the signed-in user's saved analyses, as returned by the API. */
interface SavedAnalysis {
  id: string
  repo_name: string | null
  repo_url: string | null
  quality_score: number | null
  agents_md: string | null
  created_at: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Derive a safe download filename, e.g. "owner-repo-AGENTS.md". */
function fileNameFor(repoName: string | null): string {
  const base = (repoName || "repository").replace(/[^a-zA-Z0-9._-]+/g, "-")
  return `${base}-AGENTS.md`
}

export default function HistoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    fetch(`/api/analyses/${encodeURIComponent(params.id)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        if (cancelled) return
        if (!r.ok || d.error) {
          setError(d.error || "Failed to load this analysis")
        } else {
          setAnalysis(d.analysis as SavedAnalysis)
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Failed to load this analysis")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [params.id])

  const handleCopy = async () => {
    if (!analysis?.agents_md) return
    try {
      await navigator.clipboard.writeText(analysis.agents_md)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard may be unavailable (non-HTTPS / denied permission) — the
      // user can still select the text manually in the code block below.
    }
  }

  const handleDownload = () => {
    if (!analysis?.agents_md) return
    const blob = new Blob([analysis.agents_md], {
      type: "text/markdown;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileNameFor(analysis.repo_name)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    if (!confirm("Remove this analysis from your history? This cannot be undone.")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/analyses/${encodeURIComponent(params.id)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d?.error || "Failed to delete.")
        setDeleting(false)
        return
      }
      router.push("/dashboard")
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "Failed to delete.")
      setDeleting(false)
    }
  }

  const shell = (children: React.ReactNode) => (
    <main style={{ minHeight: "100vh", background: "var(--bg-warm)" }}>
      <div style={{ height: "4px", background: "var(--blue-60)" }} />
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          height: "64px",
          borderBottom: "1px solid var(--rule)",
          background: "white",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}
        >
          <span style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink)" }}>
            RepoContext
          </span>
        </Link>
        <Link
          href="/dashboard"
          style={{ fontSize: "13px", color: "var(--ink-2)", textDecoration: "none", fontWeight: 500 }}
        >
          ← Dashboard
        </Link>
      </nav>
      {children}
    </main>
  )

  if (loading) {
    return shell(
      <div style={{ padding: "80px 48px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
        Loading analysis…
      </div>,
    )
  }

  if (error || !analysis) {
    return shell(
      <div style={{ padding: "80px 48px", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "28px",
            fontWeight: 400,
            margin: "0 0 12px 0",
          }}
        >
          Analysis not available
        </h1>
        <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.6 }}>
          {error || "This analysis may have been deleted, or it belongs to another account."}
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "10px 20px",
            background: "var(--blue-60)",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to dashboard →
        </Link>
      </div>,
    )
  }

  return shell(
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--blue-70)",
          marginBottom: "12px",
        }}
      >
        Saved analysis
      </div>
      <h1
        style={{
          fontFamily: "'IBM Plex Serif', Georgia, serif",
          fontSize: "34px",
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          margin: "0 0 12px 0",
          wordBreak: "break-word",
        }}
      >
        {analysis.repo_name || "Unknown repository"}
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          fontSize: "13px",
          color: "var(--muted)",
          marginBottom: "28px",
        }}
      >
        {analysis.quality_score !== null && (
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              color:
                analysis.quality_score >= 80
                  ? "#1f9d55"
                  : analysis.quality_score >= 60
                    ? "#d97706"
                    : "#dc2626",
            }}
          >
            Score {analysis.quality_score}/100
          </span>
        )}
        <span>{formatDate(analysis.created_at)}</span>
        {analysis.repo_url && (
          <a
            href={analysis.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--blue-70)", textDecoration: "none", fontWeight: 500 }}
          >
            GitHub ↗
          </a>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            appearance: "none",
            border: "1px solid var(--blue-60)",
            background: "var(--blue-60)",
            color: "white",
            fontSize: "13px",
            fontWeight: 600,
            padding: "9px 18px",
            cursor: "pointer",
          }}
        >
          {copied ? "Copied ✓" : "Copy AGENTS.md"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          style={{
            appearance: "none",
            border: "1px solid var(--rule)",
            background: "white",
            color: "var(--ink-2)",
            fontSize: "13px",
            fontWeight: 600,
            padding: "9px 18px",
            cursor: "pointer",
          }}
        >
          Download .md
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={{
            appearance: "none",
            border: "1px solid var(--rule)",
            background: "white",
            color: "#b42318",
            fontSize: "13px",
            fontWeight: 600,
            padding: "9px 18px",
            cursor: deleting ? "default" : "pointer",
            marginLeft: "auto",
          }}
        >
          {deleting ? "Removing…" : "Remove from history"}
        </button>
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid var(--rule)",
          padding: "24px 28px",
        }}
      >
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            fontSize: "13px",
            lineHeight: 1.65,
            color: "var(--ink-2)",
          }}
        >
          {analysis.agents_md || "(No content was stored for this analysis.)"}
        </pre>
      </div>
    </div>,
  )
}
