"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ResultView, { type ResultData } from "./_components/ResultView"
import { readRecent, loadRecent } from "@/lib/recent-analyses"

function LoadingScreen() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-warm)",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "var(--muted)",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        Loading results…
      </div>
    </main>
  )
}

/**
 * Shown when there is no result to render — most often someone refreshing
 * /result in a browser that cleared sessionStorage. Bouncing straight to
 * the homepage loses the context of what they were doing; offering their
 * recent analyses lets them get back in one click.
 */
function NoResultScreen() {
  const [recent, setRecent] = useState<
    { repoUrl: string; repoName: string; quality: number; savedAt: string }[]
  >([])

  useEffect(() => {
    setRecent(readRecent())
  }, [])

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-warm)",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--ink)",
            margin: "0 0 12px",
          }}
        >
          This result is no longer in this tab
        </h1>
        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.6,
            color: "var(--muted)",
            margin: "0 0 28px",
          }}
        >
          Results are kept in your browser, so opening this link in a new tab
          or after a long gap can lose them. You can analyze the repository
          again, or pick up one of your recent runs below.
        </p>

        {recent.length > 0 && (
          <div
            style={{
              border: "1px solid var(--rule)",
              background: "white",
              marginBottom: "28px",
            }}
          >
            {recent.map((entry) => (
              <a
                key={entry.repoUrl}
                href={`/result?repo=${encodeURIComponent(entry.repoUrl)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--rule)",
                  textDecoration: "none",
                  color: "var(--ink)",
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.repoName}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                    {new Date(entry.savedAt).toLocaleString()}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.quality}/100
                </span>
              </a>
            ))}
          </div>
        )}

        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "var(--blue-50)",
            color: "white",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Analyze a repository
        </a>
      </div>
    </main>
  )
}

function ResultContent() {
  const [data, setData] = useState<ResultData | null>(null)
  const [missing, setMissing] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const repoUrl = searchParams.get("repo") || ""

  const resolve = useCallback(() => {
    // 1. Fresh result from the tab that ran the analysis.
    try {
      const stored = sessionStorage.getItem("repoResult")
      if (stored) {
        setData(JSON.parse(stored) as ResultData)
        return
      }
    } catch {
      // fall through to the persisted copy
    }

    // 2. Persisted copy from an earlier run of the same repository.
    if (repoUrl) {
      const persisted = loadRecent(repoUrl)
      if (persisted) {
        setData(persisted as ResultData)
        return
      }
    }

    setMissing(true)
  }, [repoUrl])

  useEffect(() => {
    resolve()
    setLoading(false)
  }, [resolve, router])

  if (loading) {
    return <LoadingScreen />
  }

  if (missing) {
    return <NoResultScreen />
  }

  return <ResultView initialData={data} repoUrl={repoUrl} />
}

// useSearchParams() must sit inside a Suspense boundary, otherwise the
// static prerender of /result fails during `next build`.
export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResultContent />
    </Suspense>
  )
}
