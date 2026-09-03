"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ResultView, { type ResultData } from "./_components/ResultView"

export default function ResultPage() {
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
    return (
      <main style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-warm)",
      }}>
        <div style={{ fontSize: "14px", color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace" }}>
          Loading results…
        </div>
      </main>
    )
  }

  return <ResultView initialData={data} repoUrl={repoUrl} />
}
