"use client"

import { useEffect, useRef, useState } from "react"
import { locales, localeLabels, localeShort, type Locale } from "@/app/i18n/config"
import { useTranslation } from "./LanguageProvider"

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          border: "1px solid var(--rule)",
          background: "white",
          color: "var(--ink)",
          fontSize: "13px",
          fontWeight: 500,
          padding: "6px 12px",
          borderRadius: "999px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <span aria-hidden>🌐</span>
        <span>{localeLabels[locale]}</span>
        <span aria-hidden style={{ fontSize: "10px", opacity: 0.6 }}>▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            margin: 0,
            padding: "4px",
            minWidth: "140px",
            background: "white",
            border: "1px solid var(--rule)",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            listStyle: "none",
            zIndex: 200,
          }}
        >
          {locales.map((l) => {
            const active = l === locale
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLocale(l)
                    setOpen(false)
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: active ? "var(--blue-50)" : "transparent",
                    color: active ? "white" : "var(--ink)",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 500,
                    padding: "8px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <span>{localeLabels[l]}</span>
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>{localeShort[l]}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}