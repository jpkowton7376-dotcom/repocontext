"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SiteNav } from "@/components/SiteNav"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

type Status =
  | "idle"
  | "sending"
  | "sent"
  | "error"

const SUPPORT_EMAIL = "support@repocontext.dev"
const MAX_MESSAGE = 4000

export default function SupportPage() {
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [sentTo, setSentTo] = useState<string | null>(null)

  // Pre-fill the email for signed-in users so they don't have to type it.
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setEmail(session.user.email)
    })
  }, [])

  const remaining = MAX_MESSAGE - message.length

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) {
      setErrorMsg("Please describe your question or issue.")
      setStatus("error")
      return
    }
    setStatus("sending")
    setErrorMsg("")
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          email: email.trim() || undefined,
          page: typeof window !== "undefined" ? window.location.pathname : "/",
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        // 502 means neither email nor DB storage worked — offer the mailto
        // fallback so the visitor still has a way to reach us.
        setErrorMsg(
          data?.error ||
            "We couldn't send your message right now. Please email us directly instead.",
        )
        setStatus("error")
        return
      }
      setSentTo(email.trim() || null)
      setStatus("sent")
    } catch {
      setErrorMsg("Network error. Please email us directly.")
      setStatus("error")
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-warm)", display: "flex", flexDirection: "column" }}>
      <SiteNav />

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "72px 48px 96px", width: "100%" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--blue-70)",
            marginBottom: "16px",
          }}
        >
          Support
        </div>
        <h1
          style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "40px",
            fontWeight: 300,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            margin: "0 0 12px 0",
          }}
        >
          How can we help?
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "var(--muted)",
            lineHeight: 1.6,
            margin: "0 0 32px 0",
          }}
        >
          Send us a message and we'll get back to you. Leave your email if you'd
          like a reply — otherwise just describe what's going on.
        </p>

        {status === "sent" ? (
          <div
            style={{
              background: "white",
              border: "1px solid var(--rule)",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
            <h2
              style={{
                fontFamily: "'IBM Plex Serif', Georgia, serif",
                fontSize: "24px",
                fontWeight: 400,
                margin: "0 0 8px 0",
              }}
            >
              Message received
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
              {sentTo
                ? `We'll reply to ${sentTo} as soon as we can.`
                : "We'll look into this shortly."}
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: "24px",
                padding: "10px 20px",
                background: "var(--blue-60)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to RepoContext →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            style={{
              background: "white",
              border: "1px solid var(--rule)",
              padding: "32px",
            }}
          >
            <label
              htmlFor="support-message"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--ink-2)",
                marginBottom: "8px",
              }}
            >
              Your message
            </label>
            <textarea
              id="support-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
              rows={6}
              placeholder="Describe your question, a bug you hit, or a feature you'd love to see…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "inherit",
                fontSize: "14px",
                color: "var(--ink)",
                padding: "12px 14px",
                border: "1px solid var(--rule)",
                borderRadius: "6px",
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
                fontSize: "12px",
                color: remaining < 200 ? "#d97706" : "var(--muted)",
              }}
            >
              <span>{remaining < 200 ? `${remaining} characters left` : ""}</span>
            </div>

            <label
              htmlFor="support-email"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--ink-2)",
                margin: "20px 0 8px 0",
              }}
            >
              Email (optional, for replies)
            </label>
            <input
              id="support-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={SUPPORT_EMAIL}
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "inherit",
                fontSize: "14px",
                color: "var(--ink)",
                padding: "11px 14px",
                border: "1px solid var(--rule)",
                borderRadius: "6px",
              }}
            />

            {status === "error" && (
              <div
                style={{
                  marginTop: "18px",
                  fontSize: "13px",
                  color: "#b42318",
                  lineHeight: 1.6,
                }}
              >
                {errorMsg}{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  style={{ color: "#b42318", fontWeight: 600 }}
                >
                  Email us directly →
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                marginTop: "24px",
                width: "100%",
                appearance: "none",
                border: "none",
                background: "var(--blue-60)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                padding: "13px 20px",
                cursor: status === "sending" ? "default" : "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>

            <p
              style={{
                marginTop: "16px",
                fontSize: "12px",
                color: "var(--muted)",
                textAlign: "center",
                margin: 0,
              }}
            >
              For anything urgent, email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{ color: "var(--blue-70)", textDecoration: "none", fontWeight: 500 }}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
