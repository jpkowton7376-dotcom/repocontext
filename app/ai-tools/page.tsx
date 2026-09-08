"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { SiteNav } from "@/components/SiteNav"
import { useTranslation } from "@/components/LanguageProvider"
import { AI_TOOL_CATEGORIES, AI_TOOL_TOTAL, toolHostname, toolLogo } from "@/lib/ai-tools"

function BrandIcon({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const logo = toolLogo(url)
  if (failed) {
    return (
      <span
        aria-hidden
        style={{
          width: "40px",
          height: "40px",
          flexShrink: 0,
          borderRadius: "9px",
          background: "var(--blue-50)",
          color: "white",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    )
  }
  return (
    <img
      src={logo}
      alt={`${name} logo`}
      width={40}
      height={40}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        width: "40px",
        height: "40px",
        flexShrink: 0,
        borderRadius: "9px",
        objectFit: "contain",
        border: "1px solid var(--rule)",
        background: "white",
      }}
    />
  )
}

export default function AiToolsPage() {
  const { t, locale } = useTranslation()
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()

  const categories = useMemo(() => {
    if (!q) return AI_TOOL_CATEGORIES
    return AI_TOOL_CATEGORIES.map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(q) ||
          tool.desc[locale].toLowerCase().includes(q) ||
          tool.url.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.tools.length > 0)
  }, [q, locale])

  const resultCount = categories.reduce((sum, c) => sum + c.tools.length, 0)

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Nav */}
      <SiteNav variant="light" />

      {/* Hero */}
      <section
        style={{
          padding: "56px 48px 36px",
          textAlign: "center",
          background: "linear-gradient(180deg, #f6f8fb 0%, white 100%)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "14px",
          }}
        >
          {t("aiTools.eyebrow")}
        </p>
        <h1
          style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontSize: "44px",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            margin: "0 0 16px 0",
          }}
        >
          {t("aiTools.title")}
        </h1>
        <p
          style={{
            fontSize: "17px",
            color: "var(--ink-2)",
            lineHeight: 1.6,
            maxWidth: "620px",
            margin: "0 auto 28px",
          }}
        >
          {t("aiTools.subtitle", { count: AI_TOOL_TOTAL })}
        </p>

        {/* Brand mark */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px 6px 8px",
            border: "1px solid var(--rule)",
            borderRadius: "999px",
            background: "white",
            marginBottom: "28px",
            fontSize: "13px",
            color: "var(--muted)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "var(--blue-50)",
              color: "white",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 3 4 7l4 4" />
              <path d="M16 21l4-4-4-4" />
              <line x1="4" y1="7" x2="20" y2="17" />
            </svg>
          </span>
          <span style={{ fontWeight: 500, color: "var(--ink)" }}>RepoContext</span>
          <span>·</span>
          <span>{t("aiTools.curatedBy")}</span>
        </div>

        {/* Search */}
        <div style={{ maxWidth: "520px", margin: "0 auto", position: "relative" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("aiTools.search")}
            aria-label={t("aiTools.search")}
            style={{
              width: "100%",
              height: "46px",
              padding: "0 16px 0 42px",
              fontSize: "15px",
              border: "1px solid var(--rule)",
              borderRadius: "4px",
              outline: "none",
              background: "white",
              color: "var(--ink)",
              boxSizing: "border-box",
            }}
          />
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#949494"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ position: "absolute", left: "15px", top: "15px" }}
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <p style={{ fontSize: "12px", color: "var(--muted-2)", marginTop: "14px" }}>
          {q ? `${resultCount} ${t("aiTools.matched")}` : `${AI_TOOL_TOTAL} ${t("aiTools.matched")}`}
        </p>
      </section>

      {/* Body */}
      <section
        style={{
          flex: 1,
          maxWidth: "1320px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 48px 96px",
          display: "flex",
          gap: "40px",
          alignItems: "flex-start",
          boxSizing: "border-box",
        }}
      >
        {/* Sidebar */}
        <aside
          className="hidden lg:block"
          style={{ width: "188px", flexShrink: 0, position: "sticky", top: "96px" }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted-2)",
              marginBottom: "12px",
            }}
          >
            {t("aiTools.categories")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {AI_TOOL_CATEGORIES.map((cat) => {
              const visible = categories.find((c) => c.id === cat.id)
              return (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    fontSize: "13px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: visible ? "var(--ink-2)" : "var(--muted-2)",
                    opacity: visible ? 1 : 0.45,
                  }}
                >
                  <span>{cat.name[locale]}</span>
                  <span style={{ fontSize: "11px", color: "var(--muted-2)" }}>{cat.tools.length}</span>
                </a>
              )
            })}
          </div>
        </aside>

        {/* Categories */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {categories.length === 0 && (
            <p style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "15px" }}>
              {t("aiTools.empty")}
            </p>
          )}

          {categories.map((cat) => (
            <section key={cat.id} id={cat.id} style={{ marginBottom: "48px", scrollMarginTop: "88px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "10px",
                  marginBottom: "16px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <h2 style={{ fontSize: "19px", fontWeight: 600, margin: 0, color: "var(--ink)" }}>
                  {cat.name[locale]}
                </h2>
                <span style={{ fontSize: "12px", color: "var(--muted-2)" }}>{cat.tools.length}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {cat.tools.map((tool) => (
                  <a
                    key={`${cat.id}-${tool.name}-${tool.url}`}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${tool.name} · ${t("aiTools.official")}`}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "14px 16px",
                      border: "1px solid var(--rule)",
                      borderRadius: "6px",
                      background: "white",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "border-color .15s ease, box-shadow .15s ease",
                    }}
                  >
                    <BrandIcon url={tool.url} name={tool.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)", lineHeight: 1.35 }}>
                          {tool.name}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          lineHeight: 1.55,
                          color: "var(--muted)",
                          margin: "6px 0 0",
                        }}
                      >
                        {tool.desc[locale]}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--muted-2)",
                          margin: "8px 0 0",
                          fontFamily: "'IBM Plex Mono', monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {toolHostname(tool.url)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--rule)", padding: "32px 48px", background: "white" }}>
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            fontSize: "13px",
            color: "var(--muted-2)",
          }}
        >
          <span>© {new Date().getFullYear()} RepoContext</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/" style={{ color: "var(--muted-2)", textDecoration: "none" }}>
              {t("nav.features")}
            </Link>
            <Link href="/pricing" style={{ color: "var(--muted-2)", textDecoration: "none" }}>
              {t("nav.pricing")}
            </Link>
            <Link href="/terms" style={{ color: "var(--muted-2)", textDecoration: "none" }}>
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
