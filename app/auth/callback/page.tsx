"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

/**
 * OAuth redirect target. Supabase's PKCE flow bounces the user back here
 * with a `?code=...` query param; we exchange it for a session (which
 * carries the GitHub `provider_token` used for private-repo access) and
 * then send them on to `?next=` (defaults to /dashboard).
 *
 * `next` is the page that triggered the flow:
 *   - /dashboard  → "Continue with GitHub" on the login/signup pages
 *   - /           → "Connect GitHub" from the homepage analyzer
 */
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const next = params.get("next") || "/dashboard"

    if (!code) {
      router.replace(next)
      return
    }

    supabase?.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        router.replace(error ? "/login?github=error" : next)
      })
      .catch(() => {
        router.replace("/login?github=error")
      })
  }, [router])

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
      }}
    >
      <div
        style={{
          color: "#8b95a8",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "14px",
          letterSpacing: "0.05em",
        }}
      >
        Connecting to GitHub…
      </div>
    </main>
  )
}
