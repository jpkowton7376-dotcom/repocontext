"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, Plus, ArrowUpDown } from "lucide-react"
import { SiteNav } from "@/components/SiteNav"
import { JsonLd } from "@/components/JsonLd"
import { WorkshopProjectCard } from "@/components/WorkshopProjectCard"
import { useTranslation } from "@/components/LanguageProvider"
import { useWorkshop } from "@/lib/workshop-store"
import {
  CATEGORIES,
  SortKey,
  filterProjects,
  sortProjects,
} from "@/lib/workshop-data"
import { SITE_URL } from "@/lib/site-url"
import type { Locale } from "@/app/i18n/config"

export function WorkshopFeed() {
  const { t, locale } = useTranslation()
  const L = locale as Locale
  const { projects, hydrated, star, isStarred } = useWorkshop()

  const [sort, setSort] = useState<SortKey>("trending")
  const [category, setCategory] = useState<string>("All")
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const q = new URLSearchParams(window.location.search).get("q")
    if (q) setQuery(q)
  }, [])

  const visible = useMemo(
    () => sortProjects(filterProjects(projects, category, query), sort),
    [projects, category, query, sort],
  )

  return (
    <main style={{ minHeight: "100vh", background: "white" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("workshop.title"),
          description: t("workshop.subtitle"),
          url: `${SITE_URL}/workshop`,
          isPartOf: { "@type": "WebSite", name: "RepoContext", url: SITE_URL },
        }}
      />

      <SiteNav variant="light" />

      <header
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "56px 24px 12px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: "-.02em" }}>
          {t("workshop.title")}
        </h1>
        <p style={{ margin: "12px 0 0", fontSize: 18, color: "#475569", maxWidth: 640 }}>
          {t("workshop.subtitle")}
        </p>
      </header>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "20px 24px 0" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 260px",
              maxWidth: 360,
            }}
          >
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("workshop.searchPlaceholder")}
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 15,
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
              {projects.length} {t("workshop.projects").toLowerCase()}
            </span>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <ArrowUpDown size={15} color="#64748b" style={{ position: "absolute", left: 12 }} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                style={{
                  appearance: "none",
                  padding: "10px 34px 10px 36px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0f172a",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <option value="trending">{t("workshop.sortBy")}: {t("workshop.trending")}</option>
                <option value="newest">{t("workshop.sortBy")}: {t("workshop.newest")}</option>
                <option value="top">{t("workshop.sortBy")}: {t("workshop.top")}</option>
              </select>
            </div>
            <Link
              href="/workshop/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "11px 16px",
                borderRadius: 12,
                background: "#0f172a",
                color: "white",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <Plus size={16} /> {t("workshop.newProject")}
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "18px 0 4px" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: category === c ? "#0f172a" : "#e2e8f0",
                background: category === c ? "#0f172a" : "white",
                color: category === c ? "white" : "#475569",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {c === "All" ? t("workshop.all") : c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "24px 24px 80px" }}>
        {visible.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 16 }}>{t("workshop.empty")}</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 22,
            }}
          >
            {visible.map((p) => (
              <WorkshopProjectCard
                key={p.slug}
                project={p}
                starred={isStarred(p.slug)}
                onStar={() => star(p.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
