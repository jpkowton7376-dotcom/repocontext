"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Star, Copy, Check, ArrowLeft } from "lucide-react"
import { useTranslation } from "@/components/LanguageProvider"
import { useForge } from "@/lib/forge-store"
import {
  type HardwareProject,
  getProjectBySlug,
  partsCount,
  totalCost,
  relatedProjects,
  formatRelativeTime,
} from "@/lib/forge-data"
import { ForgeProjectCard } from "@/components/ForgeProjectCard"

type Tab = "info" | "parts" | "wiring" | "mech" | "instructions"

export function ProjectDetail({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const { projects, hydrated, isStarred, star } = useForge()
  const [tab, setTab] = useState<Tab>("info")
  const [copied, setCopied] = useState(false)

  const project = getProjectBySlug(projects, slug)

  const related = useMemo(
    () => (project ? relatedProjects(projects, project) : []),
    [projects, project],
  )

  if (!project) {
    return (
      <main style={{ minHeight: "100vh", background: "white", padding: 48 }}>
        <Link href="/forge" style={{ color: "#2563eb", textDecoration: "none" }}>
          ← {t("forge.backToForge")}
        </Link>
        <p style={{ marginTop: 24, fontSize: 18, color: "#475569" }}>
          {hydrated ? t("forge.projectNotFound") : "…"}
        </p>
      </main>
    )
  }

  const starred = isStarred(project.slug)
  const count = partsCount(project)
  const cost = totalCost(project)
  const starTotal = project.stars + (starred ? 1 : 0)

  const buildMarkdown = () => {
    const lines = [
      `# ${project.title}`,
      "",
      project.summary,
      "",
      `By ${project.author} · ${count} parts · est. $${cost.toFixed(2)}`,
      "",
      "## Parts",
    ]
    for (const part of project.parts) {
      lines.push(
        `- ${part.name} (${part.category}/${part.subcategory}) ×${part.quantity} — $${(part.unitCost * part.quantity).toFixed(2)}`,
      )
    }
    lines.push("", "## Wiring", project.wiring, "", "## Mechanics", project.mech, "", "## Instructions")
    project.instructions.forEach((step, i) => lines.push(`${i + 1}. ${step}`))
    return lines.join("\n")
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdown())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: t("forge.tabInfo") },
    { key: "parts", label: t("forge.tabParts") },
    { key: "wiring", label: t("forge.tabWiring") },
    { key: "mech", label: t("forge.tabMech") },
    { key: "instructions", label: t("forge.tabInstructions") },
  ]

  const categories = ["Electrical", "Mechanical"] as const

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px 80px" }}>
        <Link
          href="/forge"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#2563eb", textDecoration: "none", fontWeight: 600, fontSize: 14 }}
        >
          <ArrowLeft size={16} /> {t("forge.backToForge")}
        </Link>

        <div
          style={{
            marginTop: 20,
            background: "white",
            border: "1px solid #e7eaf0",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              aspectRatio: "16 / 7",
              background: "#0b1120",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.cover} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          <div style={{ padding: "22px 26px 26px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-.01em" }}>{project.title}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, color: "#475569", fontSize: 14, fontWeight: 500 }}>
                  <span
                    style={{
                      width: 26, height: 26, borderRadius: "50%", background: project.avatarColor,
                      color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                    }}
                  >
                    {project.author.slice(0, 1)}
                  </span>
                  <span>{t("forge.by")} <strong style={{ color: "#0f172a" }}>{project.author}</strong></span>
                  <span>·</span>
                  <span>{formatRelativeTime(project.createdAt)}</span>
                  <span>·</span>
                  <span>{count} {t("forge.parts").toLowerCase()}</span>
                  <span>·</span>
                  <span>${cost.toFixed(2)} est.</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => star(project.slug)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px",
                    borderRadius: 12, border: "1px solid #e2e8f0", background: starred ? "#fef9c3" : "white",
                    color: starred ? "#854d0e" : "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: 14,
                  }}
                >
                  <Star size={16} fill={starred ? "#ca8a04" : "none"} /> {starTotal}
                </button>
                <button
                  type="button"
                  onClick={onCopy}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px",
                    borderRadius: 12, border: "none", background: "#0f172a", color: "white",
                    fontWeight: 700, cursor: "pointer", fontSize: 14,
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? t("forge.copied") : t("forge.copy")}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {project.tags.map((tag) => (
                <span key={tag} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "#2563eb", background: "#eff6ff", padding: "4px 9px", borderRadius: 999 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, borderBottom: "1px solid #e2e8f0", marginTop: 22, padding: "0 4px" }}>
          {tabs.map((tb) => (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              style={{
                padding: "12px 16px", border: "none", background: "none", cursor: "pointer",
                fontSize: 15, fontWeight: 700, color: tab === tb.key ? "#0f172a" : "#94a3b8",
                borderBottom: tab === tb.key ? "2px solid #0f172a" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          {tab === "info" && (
            <section>
              <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".06em", color: "#94a3b8", margin: "0 0 10px" }}>
                {t("forge.aiSummary")}
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: "#1e293b", margin: 0 }}>{project.summary}</p>
            </section>
          )}

          {tab === "parts" && (
            <section style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {categories.map((cat) => {
                const items = project.parts.filter((p) => p.category === cat)
                if (!items.length) return null
                return (
                  <div key={cat}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px" }}>{cat}</h2>
                    <div style={{ border: "1px solid #e7eaf0", borderRadius: 14, overflow: "hidden", background: "white" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left" }}>
                            <th style={{ padding: "12px 16px", fontWeight: 600 }}>Part</th>
                            <th style={{ padding: "12px 16px", fontWeight: 600 }}>Type</th>
                            <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Qty</th>
                            <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Unit</th>
                            <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((part, i) => (
                            <tr key={i} style={{ borderTop: "1px solid #eef2f7" }}>
                              <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{part.name}</td>
                              <td style={{ padding: "12px 16px", color: "#64748b" }}>{part.subcategory}</td>
                              <td style={{ padding: "12px 16px", textAlign: "right", color: "#475569" }}>{part.quantity}</td>
                              <td style={{ padding: "12px 16px", textAlign: "right", color: "#475569" }}>${part.unitCost.toFixed(2)}</td>
                              <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>${(part.quantity * part.unitCost).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
              <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 16 }}>
                <span style={{ background: "#0f172a", color: "white", padding: "10px 18px", borderRadius: 12, fontWeight: 700 }}>
                  {t("forge.total")}: ${cost.toFixed(2)}
                </span>
              </div>
            </section>
          )}

          {tab === "wiring" && (
            <Panel title={t("forge.tabWiring")}>{project.wiring}</Panel>
          )}

          {tab === "mech" && (
            <Panel title={t("forge.tabMech")}>{project.mech}</Panel>
          )}

          {tab === "instructions" && (
            <section>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                {project.instructions.map((step, i) => (
                  <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span
                      style={{
                        flex: "0 0 28px", height: 28, borderRadius: "50%", background: "#0f172a", color: "white",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 16, lineHeight: 1.6, color: "#1e293b", paddingTop: 2 }}>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {related.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 18px" }}>{t("forge.relatedTitle")}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
              {related.map((p) => (
                <ForgeProjectCard key={p.slug} project={p} starred={isStarred(p.slug)} onStar={() => star(p.slug)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function Panel({ title, children }: { title: string; children: string }) {
  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 12px" }}>{title}</h2>
      <div
        style={{
          background: "white", border: "1px solid #e7eaf0", borderRadius: 14,
          padding: 22, fontSize: 16, lineHeight: 1.65, color: "#1e293b",
        }}
      >
        {children}
      </div>
    </section>
  )
}
