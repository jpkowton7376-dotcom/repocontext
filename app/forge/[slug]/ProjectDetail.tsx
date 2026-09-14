"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Star, Copy, Check, ArrowLeft, ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react"
import { useTranslation } from "@/components/LanguageProvider"
import { useForge } from "@/lib/forge-store"
import {
  type HardwareProject,
  type WiringNode,
  type WiringEdge,
  getProjectBySlug,
  partsCount,
  totalCost,
  categorySummary,
  relatedProjects,
  formatRelativeTime,
  flattenBuild,
} from "@/lib/forge-data"
import { ForgeProjectCard } from "@/components/ForgeProjectCard"

type Tab = "info" | "parts" | "wiring" | "mech" | "instructions"

const DONE_KEY = "rc_forge_done_v1"

function loadDone(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(DONE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

const KIND_COLORS: Record<string, string> = {
  mcu: "#2563eb",
  sensor: "#16a34a",
  actuator: "#ea580c",
  power: "#dc2626",
  module: "#7c3aed",
}

export function ProjectDetail({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const { projects, hydrated, isStarred, star } = useForge()
  const [tab, setTab] = useState<Tab>("info")
  const [copied, setCopied] = useState(false)
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [openStep, setOpenStep] = useState<string | null>(null)

  const project = getProjectBySlug(projects, slug)

  // Load step progress once the client is active.
  useEffect(() => {
    setDone(loadDone())
  }, [])

  // Reflect the project name in the browser tab.
  useEffect(() => {
    if (project) document.title = `${project.title} — RepoContext`
  }, [project])

  const related = useMemo(
    () => (project ? relatedProjects(projects, project) : []),
    [projects, project],
  )

  const steps = useMemo(() => (project ? flattenBuild(project) : []), [project])
  const doneCount = steps.filter((s) => done[s.key]).length

  const toggleDone = (key: string) => {
    setDone((prev) => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = true
      try {
        window.localStorage.setItem(DONE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

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
  const catRows = categorySummary(project)

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
    const mechText =
      project.mech ||
      [
        ...(project.mechSpecs?.map((s) => `- ${s.label}: ${s.value}`) ?? []),
        ...(project.mechSections?.map((s) => `### ${s.title}\n${s.body}`) ?? []),
      ].join("\n")
    lines.push("", "## Wiring", project.wiring, "", "## Mechanics", mechText, "", "## Instructions")
    if (project.build) {
      lines.push("", "### Tools", ...project.build.tools.map((x) => `- ${x}`))
      lines.push("", "### Assumptions", ...project.build.assumptions.map((x) => `- ${x}`))
      project.build.phases.forEach((phase, pi) => {
        lines.push("", `### ${pi + 1}. ${phase.title}`)
        phase.steps.forEach((step, si) => {
          lines.push(`${pi + 1}.${si + 1} ${step.title}`)
          if (step.detail) lines.push(`   ${step.detail}`)
        })
      })
    } else {
      project.instructions.forEach((step, i) => lines.push(`${i + 1}. ${step}`))
    }
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
          <div style={{ aspectRatio: "16 / 7", background: "#0b1120" }}>
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
            <section style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              {project.features && project.features.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {project.features.map((f) => (
                    <span key={f} style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", background: "white", border: "1px solid #dbe3ee", padding: "6px 12px", borderRadius: 999 }}>
                      {f}
                    </span>
                  ))}
                </div>
              )}

              <section>
                <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".06em", color: "#94a3b8", margin: "0 0 10px" }}>
                  {t("forge.aiSummary")}
                </h2>
                <p style={{ fontSize: 17, lineHeight: 1.6, color: "#1e293b", margin: 0 }}>{project.summary}</p>
              </section>

              {catRows.length > 0 && (
                <section>
                  <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".06em", color: "#94a3b8", margin: "0 0 10px" }}>
                    {t("forge.parts")}
                  </h2>
                  <div style={{ border: "1px solid #e7eaf0", borderRadius: 14, overflow: "hidden", background: "white" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left" }}>
                          <th style={{ padding: "12px 16px", fontWeight: 600 }}>{t("forge.category")}</th>
                          <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>{t("forge.parts")}</th>
                          <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catRows.map((row) => (
                          <tr key={row.category} style={{ borderTop: "1px solid #eef2f7" }}>
                            <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{row.category}</td>
                            <td style={{ padding: "12px 16px", textAlign: "right", color: "#475569" }}>{row.parts}</td>
                            <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>${row.cost.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: "2px solid #0f172a" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 800, color: "#0f172a" }}>{t("forge.total")}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>{count}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>${cost.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </section>
          )}

          {tab === "parts" && <PartsTab project={project} cost={cost} />}

          {tab === "wiring" && (
            <WiringTab project={project} />
          )}

          {tab === "mech" && <MechTab project={project} />}

          {tab === "instructions" && (
            <InstructionsTab
              project={project}
              steps={steps}
              done={done}
              doneCount={doneCount}
              total={steps.length}
              onToggle={toggleDone}
              openStep={openStep}
              setOpenStep={setOpenStep}
            />
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

/* ---------------------------------- PARTS --------------------------------- */

function PartsTab({ project, cost }: { project: HardwareProject; cost: number }) {
  const { t } = useTranslation()
  const categories = ["Electrical", "Mechanical"] as const
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {categories.map((cat) => {
        const items = project.parts.filter((p) => p.category === cat)
        if (!items.length) return null
        const subcats = Array.from(new Set(items.map((i) => i.subcategory)))
        const catQty = items.reduce((s, i) => s + i.quantity, 0)
        const catCost = items.reduce((s, i) => s + i.quantity * i.unitCost, 0)
        return (
          <details key={cat} open style={{ border: "1px solid #e7eaf0", borderRadius: 14, background: "white", overflow: "hidden" }}>
            <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "14px 18px", background: "#0f172a", color: "white", listStyle: "none" }}>
              <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: ".02em", textTransform: "uppercase" }}>{cat}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>
                {catQty} pcs · ${catCost.toFixed(2)}
              </span>
            </summary>
            {subcats.map((sub) => {
              const group = items.filter((i) => i.subcategory === sub)
              const gQty = group.reduce((s, i) => s + i.quantity, 0)
              const gCost = group.reduce((s, i) => s + i.quantity * i.unitCost, 0)
              return (
                <details key={sub} style={{ borderTop: "1px solid #eef2f7" }}>
                  <summary style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", padding: "12px 18px", background: "#f8fafc" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "#475569" }}>{sub}</span>
                    <span style={{ fontSize: 13, color: "#64748b" }}>
                      {gQty} · ${gCost.toFixed(2)}
                    </span>
                  </summary>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <tbody>
                      {group.map((part, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #eef2f7" }}>
                          <td style={{ padding: "11px 18px", fontWeight: 600, color: "#0f172a" }}>{part.name}</td>
                          <td style={{ padding: "11px 18px", textAlign: "right", color: "#475569", width: 60 }}>×{part.quantity}</td>
                          <td style={{ padding: "11px 18px", textAlign: "right", color: "#64748b", width: 90 }}>${part.unitCost.toFixed(2)}</td>
                          <td style={{ padding: "11px 18px", textAlign: "right", fontWeight: 700, color: "#0f172a", width: 90 }}>${(part.quantity * part.unitCost).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              )
            })}
          </details>
        )
      })}
      <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 16 }}>
        <span style={{ background: "#0f172a", color: "white", padding: "10px 18px", borderRadius: 12, fontWeight: 700 }}>
          {t("forge.total")}: ${cost.toFixed(2)}
        </span>
      </div>
    </section>
  )
}

/* ---------------------------------- WIRING -------------------------------- */

const NODE_W = 168
const NODE_H = 46
const COL_GAP = 118
const ROW_GAP = 20
const PAD = 16

function layoutWiring(nodes: WiringNode[], edges: WiringEdge[]) {
  const layer = new Map<string, number>()
  nodes.forEach((n) => layer.set(n.id, 0))
  for (let i = 0; i < nodes.length + 1; i++) {
    edges.forEach((e) => {
      const l = layer.get(e.from)
      if (l !== undefined && (layer.get(e.to) ?? 0) < l + 1) {
        layer.set(e.to, Math.min(l + 1, 4))
      }
    })
  }
  const cols = new Map<number, WiringNode[]>()
  nodes.forEach((n) => {
    const l = layer.get(n.id) ?? 0
    if (!cols.has(l)) cols.set(l, [])
    cols.get(l)!.push(n)
  })

  const pos = new Map<string, { x: number; y: number }>()
  let maxRows = 0
  cols.forEach((colNodes) => {
    maxRows = Math.max(maxRows, colNodes.length)
  })
  const svgH = maxRows * (NODE_H + ROW_GAP) - ROW_GAP + PAD * 2
  cols.forEach((colNodes, l) => {
    const colH = colNodes.length * (NODE_H + ROW_GAP) - ROW_GAP
    const startY = (svgH - colH) / 2
    colNodes.forEach((n, i) => {
      pos.set(n.id, { x: PAD + l * (NODE_W + COL_GAP), y: startY + i * (NODE_H + ROW_GAP) })
    })
  })
  const maxLayer = Math.max(...Array.from(cols.keys()), 0)
  const svgW = PAD * 2 + (maxLayer + 1) * NODE_W + maxLayer * COL_GAP

  // Collision-aware bus labels: sample each cubic connector at several
  // points/offsets, preferring the midpoint above the curve, and reject any
  // slot that overlaps a node or a previously placed label. Labels must never
  // cover a node; label-label overlap is only used as a final fallback.
  const nodeRects = nodes.map((n) => {
    const p = pos.get(n.id)!
    return { x: p.x - 2, y: p.y - 2, w: NODE_W + 4, h: NODE_H + 4 }
  })
  const overlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }, pad = 0) =>
    a.x - pad < b.x + b.w && a.x + a.w + pad > b.x && a.y - pad < b.y + b.h && a.y + a.h + pad > b.y

  const placed: { x: number; y: number; w: number; h: number }[] = []
  const labels = edges.map((e) => {
    const a = pos.get(e.from)
    const b = pos.get(e.to)
    const w = e.label.length * 6.8 + 16
    const h = 18
    if (!a || !b) return { x: 0, y: 0, w, h, hidden: true }
    const x1 = a.x + NODE_W
    const y1 = a.y + NODE_H / 2
    const x2 = b.x
    const y2 = b.y + NODE_H / 2
    const dx = Math.max(40, (x2 - x1) / 2)
    const p0 = { x: x1, y: y1 }
    const p1 = { x: x1 + dx, y: y1 }
    const p2 = { x: x2 - dx, y: y2 }
    const p3 = { x: x2, y: y2 }
    const pointAt = (t: number) => {
      const mt = 1 - t
      return {
        x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
        y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
      }
    }
    const toRect = (pt: { x: number; y: number }, dy: number) => {
      const cx = Math.min(svgW - w / 2 - 4, Math.max(w / 2 + 4, pt.x))
      const cy = Math.min(svgH - h / 2 - 2, Math.max(h / 2 + 2, pt.y + dy))
      return { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy }
    }

    let chosen: (ReturnType<typeof toRect> & { hidden?: boolean }) | null = null
    const tCandidates = [0.5, 0.3, 0.7, 0.18, 0.82]
    const dyCandidates = [-13, 13, 0]
    for (const t of tCandidates) {
      for (const dy of dyCandidates) {
        const r = toRect(pointAt(t), dy)
        const hitsNode = nodeRects.some((n) => overlap(r, n))
        const hitsLabel = placed.some((l) => overlap(r, l, 4))
        if (!hitsNode && !hitsLabel) {
          chosen = r
          break
        }
      }
      if (chosen) break
    }
    // Fallback: allow label-label overlap, still never overlap a node.
    if (!chosen) {
      for (const t of tCandidates) {
        for (const dy of dyCandidates) {
          const r = toRect(pointAt(t), dy)
          if (!nodeRects.some((n) => overlap(r, n))) {
            chosen = r
            break
          }
        }
        if (chosen) break
      }
    }
    const final = chosen ?? { ...toRect(pointAt(0.5), -13) }
    placed.push({ x: final.x, y: final.y, w: final.w, h: final.h })
    return { x: final.cx, y: final.cy, w, h, hidden: false }
  })

  return { pos, svgW, svgH, labels }
}

function WiringTab({ project }: { project: HardwareProject }) {
  const { t } = useTranslation()
  const nodes = project.wiringNodes ?? []
  const edges = project.wiringEdges ?? []
  const labelOf = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  if (!nodes.length || !edges.length) {
    return (
      <Panel title={t("forge.tabWiring")}>
        {project.wiring}
      </Panel>
    )
  }

  const { pos, svgW, svgH, labels } = layoutWiring(nodes, edges)

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ background: "white", border: "1px solid #e7eaf0", borderRadius: 14, overflow: "auto" }}>
        <svg width={svgW} height={svgH} role="img" aria-label={`Wiring diagram for ${project.title}`} style={{ display: "block", minWidth: svgW }}>
          {edges.map((e, i) => {
            const a = pos.get(e.from)
            const b = pos.get(e.to)
            if (!a || !b) return null
            const lab = labels[i]
            const x1 = a.x + NODE_W
            const y1 = a.y + NODE_H / 2
            const x2 = b.x
            const y2 = b.y + NODE_H / 2
            const dx = Math.max(40, (x2 - x1) / 2)
            return (
              <g key={i}>
                <path
                  d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth={1.6}
                />
                {lab && !lab.hidden && (
                  <>
                    <rect x={lab.x - lab.w / 2} y={lab.y - 9} width={lab.w} height={18} rx={9} fill="white" stroke="#e2e8f0" />
                    <text x={lab.x} y={lab.y + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="#475569" fontFamily="'IBM Plex Mono', monospace">
                      {e.label}
                    </text>
                  </>
                )}
              </g>
            )
          })}
          {nodes.map((n) => {
            const p = pos.get(n.id)!
            const color = KIND_COLORS[n.kind] ?? "#475569"
            return (
              <g key={n.id}>
                <rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx={10} fill="white" stroke="#dbe3ee" />
                <rect x={p.x} y={p.y} width={5} height={NODE_H} rx={2.5} fill={color} />
                <text x={p.x + 14} y={p.y + NODE_H / 2 - 3} fontSize={12.5} fontWeight={700} fill="#0f172a">
                  {n.label.length > 22 ? n.label.slice(0, 21) + "…" : n.label}
                </text>
                <text x={p.x + 14} y={p.y + NODE_H / 2 + 13} fontSize={10} fontWeight={600} fill={color} style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>
                  {n.kind.toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <section>
        <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".06em", color: "#94a3b8", margin: "0 0 10px" }}>
          {t("forge.connections")}
        </h2>
        <div style={{ border: "1px solid #e7eaf0", borderRadius: 14, overflow: "hidden", background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left" }}>
                <th style={{ padding: "11px 16px", fontWeight: 600 }}>From</th>
                <th style={{ padding: "11px 16px", fontWeight: 600 }}>To</th>
                <th style={{ padding: "11px 16px", fontWeight: 600 }}>Bus</th>
              </tr>
            </thead>
            <tbody>
              {edges.map((e, i) => (
                <tr key={i} style={{ borderTop: "1px solid #eef2f7" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 600, color: "#0f172a" }}>{labelOf.get(e.from)?.label ?? e.from}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 600, color: "#0f172a" }}>{labelOf.get(e.to)?.label ?? e.to}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: "#2563eb", background: "#eff6ff", padding: "3px 8px", borderRadius: 6 }}>
                      {e.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Panel title={t("forge.wiringNotes")}>{project.wiring}</Panel>
    </section>
  )
}

/* ----------------------------------- MECH ---------------------------------- */

function MechTab({ project }: { project: HardwareProject }) {
  const { t } = useTranslation()
  const specs = project.mechSpecs
  const sections = project.mechSections
  if (!specs?.length && !sections?.length) {
    return <Panel title={t("forge.tabMech")}>{project.mech ?? "No mechanical details available yet."}</Panel>
  }
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {specs && specs.length > 0 && (
        <section>
          <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".06em", color: "#94a3b8", margin: "0 0 10px" }}>
            {t("forge.specs")}
          </h2>
          <div style={{ border: "1px solid #e7eaf0", borderRadius: 14, overflow: "hidden", background: "white" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                {specs.map((s, i) => (
                  <tr key={i} style={{ borderTop: i === 0 ? "none" : "1px solid #eef2f7" }}>
                    <td style={{ padding: "11px 16px", fontWeight: 700, color: "#475569", width: 180 }}>{s.label}</td>
                    <td style={{ padding: "11px 16px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: "#0f172a" }}>{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {sections && sections.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sections.map((sec, i) => (
            <div key={i} style={{ background: "white", border: "1px solid #e7eaf0", borderRadius: 14, padding: 20 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{sec.title}</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "#1e293b" }}>{sec.body}</p>
            </div>
          ))}
        </section>
      )}
    </section>
  )
}

/* ------------------------------- INSTRUCTIONS ------------------------------ */

function InstructionsTab({
  project,
  steps,
  done,
  doneCount,
  total,
  onToggle,
  openStep,
  setOpenStep,
}: {
  project: HardwareProject
  steps: ReturnType<typeof flattenBuild>
  done: Record<string, boolean>
  doneCount: number
  total: number
  onToggle: (key: string) => void
  openStep: string | null
  setOpenStep: (key: string | null) => void
}) {
  const { t } = useTranslation()
  const build = project.build
  const phases = build?.phases ?? []

  if (!build) {
    // Legacy flat list (user submissions)
    return (
      <section>
        <ProgressHeader doneCount={doneCount} total={total} label={t("forge.doneLabel")} />
        <ol style={{ margin: "18px 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map((s) => (
            <li key={s.key} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <button type="button" onClick={() => onToggle(s.key)} style={stepCheckStyle(Boolean(done[s.key]))}>
                {done[s.key] ? <CheckCircle2 size={22} color="#1f9d55" /> : <Circle size={22} color="#cbd5e1" />}
              </button>
              <span style={{ fontSize: 16, lineHeight: 1.6, color: "#1e293b", paddingTop: 2 }}>{s.title}</span>
            </li>
          ))}
        </ol>
      </section>
    )
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", margin: 0, color: "#0f172a" }}>
          {t("forge.tabInstructions")}
        </h2>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", color: doneCount === total ? "#1f9d55" : "#64748b", background: "white", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: 999 }}>
          {doneCount}/{total} {t("forge.doneLabel")}
        </span>
      </div>

      {/* Tools & Assumptions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "white", border: "1px solid #e7eaf0", borderRadius: 14, padding: 18 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "#0f172a" }}>
            {t("forge.tools")}
          </h3>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            {build.tools.map((x, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.5, color: "#334155" }}>{x}</li>
            ))}
          </ul>
        </div>
        <div style={{ background: "white", border: "1px solid #e7eaf0", borderRadius: 14, padding: 18 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "#0f172a" }}>
            {t("forge.assumptions")}
          </h3>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            {build.assumptions.map((x, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.5, color: "#334155" }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Phases */}
      {phases.map((phase, pi) => {
        const phaseSteps = steps.filter((s) => s.phaseIndex === pi)
        const phaseDone = phaseSteps.filter((s) => done[s.key]).length
        return (
          <div key={pi} style={{ background: "white", border: "1px solid #e7eaf0", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#f8fafc", borderBottom: "1px solid #eef2f7" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                {pi + 1}. {phase.title}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                {phaseDone}/{phaseSteps.length}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {phaseSteps.map((s) => {
                const isOpen = openStep === s.key
                return (
                  <div key={s.key} style={{ borderTop: "1px solid #eef2f7", padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <button type="button" onClick={() => onToggle(s.key)} style={stepCheckStyle(Boolean(done[s.key]))} aria-label={s.title}>
                        {done[s.key] ? <CheckCircle2 size={20} color="#1f9d55" /> : <Circle size={20} color="#cbd5e1" />}
                      </button>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: "#94a3b8", paddingTop: 2, flexShrink: 0 }}>
                        {s.index}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>{s.title}</div>
                        {(s.tools?.length || s.parts?.length) && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                            {s.tools?.map((tool) => (
                              <span key={tool} style={{ fontSize: 11.5, fontWeight: 600, color: "#475569", border: "1px solid #dbe3ee", padding: "3px 9px", borderRadius: 999, background: "#f8fafc" }}>
                                {tool}
                              </span>
                            ))}
                            {s.parts?.map((pn) => (
                              <span key={pn} style={{ fontSize: 11.5, fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", padding: "3px 9px", borderRadius: 999 }}>
                                {pn}
                              </span>
                            ))}
                          </div>
                        )}
                        {s.detail && (
                          <>
                            <button
                              type="button"
                              onClick={() => setOpenStep(isOpen ? null : s.key)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#2563eb", padding: 0 }}
                            >
                              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              {isOpen ? t("forge.hideDetails") : t("forge.viewDetails")}
                            </button>
                            {isOpen && (
                              <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6, color: "#475569", background: "#f8fafc", borderLeft: "3px solid #cbd5e1", padding: "10px 14px", borderRadius: "0 10px 10px 0" }}>
                                {s.detail}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}

function ProgressHeader({ doneCount, total, label }: { doneCount: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", margin: 0, color: "#0f172a" }}>
          Instructions
        </h2>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", color: doneCount === total ? "#1f9d55" : "#64748b", background: "white", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: 999 }}>
          {doneCount}/{total} {label}
        </span>
      </div>
      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#1f9d55", borderRadius: 3, transition: "width .2s" }} />
      </div>
    </div>
  )
}

function stepCheckStyle(checked: boolean): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
    marginTop: 1,
    opacity: checked ? 1 : 0.85,
  }
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
