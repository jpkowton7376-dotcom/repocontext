"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ResultView, { type ResultData } from "../_components/ResultView"

/**
 * Public read-only view of a shared analysis.
 * Loads the payload from /api/share and hands it straight to the result view.
 */
export default function SharedResultPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")

    fetch(`/api/share?id=${encodeURIComponent(params.id)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        if (cancelled) return
        if (!r.ok || d.error) {
          setError(d.error || "Failed to load this share")
        } else {
          setData(d.payload as ResultData)
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load this share")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [params.id])

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "var(--bg-cool)",
      }}>
        <div style={{ color: "var(--muted)", fontSize: "16px" }}>Loading shared analysis…</div>
        <Link href="/" style={{ fontSize: "14px", color: "var(--blue-60)", textDecoration: "none" }}>
          ← Back to RepoContext
        </Link>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        background: "var(--bg-cool)",
        padding: "48px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "48px" }}>🔗</div>
        <h1 style={{
          fontFamily: "'IBM Plex Serif', Georgia, serif",
          fontSize: "28px",
          fontWeight: 400,
          margin: 0,
        }}>
          Share not available
        </h1>
        <p style={{
          fontSize: "15px",
          color: "var(--muted)",
          maxWidth: "480px",
          lineHeight: 1.6,
          margin: 0,
        }}>
          {error || "This link may have expired or the analysis could not be loaded."}
        </p>
        <Link
          href="/"
          style={{
            padding: "12px 24px",
            background: "var(--blue-60)",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: "0.02em",
          }}
        >
          Analyze a repository →
        </Link>
      </div>
    )
  }

  return <ResultView initialData={data} />
}