"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, Plus, ArrowUpDown } from "lucide-react"
import { SiteNav } from "@/components/SiteNav"
import { JsonLd } from "@/components/JsonLd"
import { CommunityProjectCard } from "@/components/CommunityProjectCard"
import { useTranslation } from "@/components/LanguageProvider"
import { useCommunity } from "@/lib/community-store"
import {
  CATEGORIES,
  SortKey,
  filterProjects,
  sortProjects,
  formatCount,
} from "@/lib/community-data"
import { SITE_URL } from "@/lib/site-url"
import type { Locale } from "@/app/i18n/config"

export function CommunityFeed() {
  const { t, locale } = useTranslation()
  const L = locale as Locale
  const { projects, hydrated, star, isStarred } = useCommunity()

  const [sort, setSort] = useState<SortKey>("trending")
  const [category, setCategory] = useState<"all" | string>("all")
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const q = new URLSearchParams(window.location.search).get("q")
    if (q) setQuery(q)
  }, [])

  const visible = useMemo(
    () => sortProjects(filterProjects(projects, category as any, query), sort),
    [projects, category, query, sort],
  )

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("community.title"),
          description: t("community.subtitle"),
          url: `${SITE_URL}/community`,
          isPartOf: { "@type": "WebSite", name: "RepoContext", url: SITE_URL },
        }}
      />

      <SiteNav variant="light" />

      {/* Hero */}
      <header
        style={{
          padding: "56px 48px 32px",
          background: "linear-gradient(180deg, #f6f8fb 0%, white 100%)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: "720px" }}>
            <div style={{ width: "48px", height: "4px", background: "var(--blue-60)", marginBottom: "20px" }} />
            <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 12px" }}>
              {t("community.eyebrow")}
            </p>
            <h1 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: "46px", fontWeight: 300, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
              {t("community.title")}
            </h1>
            <p style={{ fontSize: "17px", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
              {t("community.subtitle")}
            </p>
          </div>
          <Link
            href="/community/new"
            className="rc-community-new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--blue-60)",
              color: "white",
              padding: "12px 20px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} /> {t("community.newProject")}
          </Link>
        </div>
      </header>

      {/* Body */}
      <section style={{ flex: 1, maxWidth: "1180px", width: "100%", margin: "0 auto", padding: "40px 48px 96px", boxSizing: "border-box" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "22px", flexWrap: "wrap", alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              minWidth: "220px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "0 14px",
              border: "1px solid var(--rule)",
              borderRadius: "6px",
              background: "white",
            }}
          >
            <Search size={16} color="var(--muted-2)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("community.searchPlaceholder")}
              className="rc-community-search"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "12px 0",
                fontSize: "14px",
                fontFamily: "inherit",
                color: "var(--ink)",
                background: "transparent",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ArrowUpDown size={15} color="var(--muted-2)" />
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>{t("community.sortBy")}:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rc-community-sort"
              style={{
                appearance: "none",
                border: "1px solid var(--rule)",
                borderRadius: "6px",
                padding: "11px 32px 11px 12px",
                fontSize: "14px",
                fontFamily: "inherit",
                color: "var(--ink)",
                background: "white",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <option value="trending">{t("community.trending")}</option>
              <option value="new">{t("community.newest")}</option>
              <option value="top">{t("community.top")}</option>
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div className="rc-community-chips" style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setCategory("all")} style={chipStyle(category === "all")}>
            {t("community.all")}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" onClick={() => setCategory(c.id)} style={chipStyle(category === c.id, c.color)}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Count + grid */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)" }}>
            <strong style={{ color: "var(--ink)" }}>{formatCount(visible.length)}</strong> {t("community.projects")}
          </p>
        </div>

        {hydrated && visible.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", border: "1px dashed var(--rule)", borderRadius: "12px", color: "var(--muted)" }}>
            {t("community.empty")}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {visible.map((p) => (
              <CommunityProjectCard
                key={p.id}
                project={p}
                filesLabel={t("community.files")}
                starsLabel={t("community.stars")}
                byLabel={t("community.by")}
                onStar={() => star(p.id)}
                isStarred={isStarred(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--rule)", padding: "32px 48px", background: "white" }}>
        <div
          style={{
            maxWidth: "1180px",
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
            <Link href="/pricing" style={{ color: "var(--muted-2)", textDecoration: "none" }}>
              {t("nav.pricing")}
            </Link>
            <Link href="/docs" style={{ color: "var(--muted-2)", textDecoration: "none" }}>
              {t("nav.docs")}
            </Link>
            <Link href="/terms" style={{ color: "var(--muted-2)", textDecoration: "none" }}>
              {t("nav.terms")}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

function chipStyle(active: boolean, color?: string): React.CSSProperties {
  return {
    padding: "7px 14px",
    borderRadius: "999px",
    border: active ? "1px solid " + (color ?? "var(--blue-50)") : "1px solid var(--rule)",
    background: active ? (color ? `${color}14` : "var(--blue-10)") : "white",
    color: active ? (color ?? "var(--blue-70)") : "var(--ink-2)",
    fontSize: "13px",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    fontFamily: "inherit",
  }
}
