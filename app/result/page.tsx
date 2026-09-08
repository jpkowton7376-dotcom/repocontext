"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ResultView, { type ResultData } from "./_components/ResultView"

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

function ResultContent() {
  const [data, setData] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const repoUrl = searchParams.get("repo") || ""

  useEffect(() => {
    const stored = sessionStorage.getItem("repoResult")
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch {
        router.push("/")
      }
    } else {
      router.push("/")
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return <LoadingScreen />
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
