"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "./LanguageProvider"

type SupportMessage = {
  id: string
  role: "user" | "system"
  text: string
  time: string
}

const STORAGE_KEY = "rc_support_history"

function loadHistory(): SupportMessage[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SupportMessage[]) : []
  } catch {
    return []
  }
}

function saveHistory(items: SupportMessage[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota errors
  }
}

function ChatBubbleIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function AwayIcon() {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0f62fe"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  )
}

export function CustomerServiceWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [history, setHistory] = useState<SupportMessage[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHistory(loadHistory())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveHistory(history)
  }, [history, hydrated])

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    const now = new Date()
    const entry: SupportMessage = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      role: "user",
      text,
      time: now.toLocaleString(),
    }
    setHistory((items) => [...items, entry])
    setDraft("")
  }, [draft])

  const handleReset = useCallback(() => {
    setHistory([])
  }, [])

  const justSent = history.length > 0 && history[history.length - 1]?.role === "user"

  return (
    <div
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: 9999,
        fontFamily: "inherit",
      }}
    >
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("support.title")}
          title={t("support.title")}
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "50%",
            background: "var(--blue-50)",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(15, 98, 254, 0.35)",
            transition: "transform .15s ease, box-shadow .15s ease",
          }}
        >
          <ChatBubbleIcon />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t("support.title")}
          style={{
            width: "320px",
            maxWidth: "calc(100vw - 32px)",
            background: "white",
            border: "1px solid var(--rule)",
            borderRadius: "12px",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              background: "var(--blue-50)",
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>{t("support.title")}</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
              }}
            >
              <CloseIcon />
            </button>
          </header>

          <div
            style={{
              padding: "14px",
              maxHeight: "360px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {history.length === 0 && (
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                {t("support.subtitle")}
              </p>
            )}

            {history.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.role === "user" ? "var(--blue-50)" : "#f2f4f8",
                  color: m.role === "user" ? "white" : "var(--ink-2)",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.text}
                <div
                  style={{
                    fontSize: "10px",
                    opacity: 0.7,
                    marginTop: "4px",
                  }}
                >
                  {m.time}
                </div>
              </div>
            ))}

            {justSent && (
              <div
                style={{
                  marginTop: "4px",
                  padding: "12px",
                  background: "#f6f8fb",
                  border: "1px solid var(--rule)",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>
                  <AwayIcon />
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--ink)",
                    margin: "0 0 4px",
                  }}
                >
                  {t("support.away")}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                    margin: "0 0 10px",
                    lineHeight: 1.5,
                  }}
                >
                  {t("support.awayMessage")}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    background: "transparent",
                    color: "var(--blue-50)",
                    border: "1px solid var(--blue-50)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {t("support.sendAnother")}
                </button>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            style={{
              borderTop: "1px solid var(--rule)",
              padding: "10px 12px",
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("support.placeholder")}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid var(--rule)",
                borderRadius: "6px",
                padding: "8px 10px",
                fontSize: "13px",
                fontFamily: "inherit",
                color: "var(--ink)",
                outline: "none",
                minHeight: "40px",
                maxHeight: "120px",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              style={{
                background: draft.trim() ? "var(--blue-50)" : "#c7cfdb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "0 14px",
                height: "40px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: draft.trim() ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              {t("support.send")}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
