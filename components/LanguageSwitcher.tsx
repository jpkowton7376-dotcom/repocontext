"use client"

import { locales, localeLabels, type Locale } from "@/app/i18n/config"
import { useTranslation } from "./LanguageProvider"

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "rgba(0,0,0,0.04)",
        borderRadius: "999px",
        padding: "4px",
      }}
    >
      {locales.map((l) => {
        const active = l === locale
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            style={{
              border: "none",
              background: active ? "#ffffff" : "transparent",
              color: active ? "#111111" : "#6f6f6f",
              fontSize: "12px",
              fontWeight: active ? 600 : 500,
              padding: "6px 12px",
              borderRadius: "999px",
              cursor: "pointer",
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
            aria-pressed={active}
          >
            {localeLabels[l]}
          </button>
        )
      })}
    </div>
  )
}
