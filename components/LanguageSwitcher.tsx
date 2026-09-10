"use client"

import { locales, localeLabels, type Locale } from "@/app/i18n/config"
import { useTranslation } from "./LanguageProvider"

/**
 * Inline language switcher showing the full language name for every option.
 * All four choices sit side by side so users immediately see it is a
 * language selection — no dropdown needed. The active one is bold and
 * underlined, so the current choice is obvious at a glance.
 */
export function LanguageSwitcher({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { locale, setLocale } = useTranslation()
  const isDark = variant === "dark"

  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{
          marginRight: "6px",
          color: isDark ? "rgba(255,255,255,0.45)" : "var(--muted-2)",
          flexShrink: 0,
        }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {locales.map((l, i) => {
        const active = l === locale
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            title={localeLabels[l]}
            aria-label={localeLabels[l]}
            aria-pressed={active}
            style={{
              border: "none",
              background: "transparent",
              color: active
                ? isDark
                  ? "white"
                  : "var(--ink)"
                : isDark
                  ? "rgba(255,255,255,0.5)"
                  : "var(--muted-2)",
              fontSize: "11px",
              fontWeight: active ? 700 : 400,
              padding: "4px 5px",
              marginLeft: i === 0 ? 0 : "1px",
              borderRadius: "4px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              textDecoration: active ? "underline" : "none",
              textUnderlineOffset: "3px",
              transition: "color .15s ease",
              flexShrink: 0,
            }}
          >
            {localeLabels[l]}
          </button>
        )
      })}
    </div>
  )
}