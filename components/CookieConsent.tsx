"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

/**
 * Bottom-anchored cookie consent banner.
 *
 * The site currently only uses functional cookies (Supabase auth, locale
 * preference) which are exempt from GDPR Art.7 consent. The banner
 * therefore focuses on transparency rather than gating — it tells the
 * user what we track and lets them dismiss the notice.
 *
 * When analytics cookies are added later, the banner can be extended
 * to read the `consent` value from localStorage and gate the analytics
 * script load. For now we keep it intentionally minimal.
 */
const STORAGE_KEY = "rc_cookie_consent"
const REPROMPT_AFTER_MS = 1000 * 60 * 60 * 24 * 180 // 6 months

type StoredConsent = {
  /** ISO timestamp the user dismissed the banner. */
  dismissedAt: string
  /** Which category they accepted. Always "essential" for now. */
  accepted: "essential" | "all"
}

function readStored(): StoredConsent | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredConsent
    if (!parsed?.dismissedAt) return null
    if (Date.now() - new Date(parsed.dismissedAt).getTime() > REPROMPT_AFTER_MS) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeStored(value: StoredConsent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private mode, quota). Silently ignore —
    // the banner will reappear on the next visit which is acceptable.
  }
}

export function CookieConsent() {
  // `null` while we are still hydrating or the user has not yet decided.
  // We deliberately wait one render after mount before reading
  // localStorage to avoid an SSR/CSR flicker.
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const stored = readStored()
    if (!stored) setOpen(true)
  }, [])

  if (!open) return null

  const dismiss = (accepted: StoredConsent["accepted"]) => {
    writeStored({ dismissedAt: new Date().toISOString(), accepted })
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      style={{
        position: "fixed",
        left: "16px",
        right: "16px",
        bottom: "16px",
        maxWidth: "640px",
        margin: "0 auto",
        zIndex: 900,
        background: "white",
        border: "1px solid #e6eaf0",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontSize: "13px",
        lineHeight: 1.5,
        color: "var(--ink)",
      }}
    >
      <div>
        <strong style={{ display: "block", marginBottom: "4px" }}>
          We use essential cookies
        </strong>
        <span style={{ color: "var(--muted)" }}>
          RepoContext uses cookies to keep you signed in and remember your
          language. We don&rsquo;t use advertising or tracking cookies.{" "}
          <Link
            href="/privacy"
            style={{ color: "var(--blue-60)", textDecoration: "underline" }}
          >
            Read the privacy policy
          </Link>
          .
        </span>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => dismiss("essential")}
          style={{
            padding: "8px 14px",
            background: "var(--blue-60)",
            color: "white",
            border: "none",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Got it
        </button>
        <button
          type="button"
          onClick={() => dismiss("essential")}
          style={{
            padding: "8px 14px",
            background: "white",
            color: "var(--muted)",
            border: "1px solid var(--rule)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Only essential
        </button>
      </div>
    </div>
  )
}
