"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/components/LanguageProvider"
import { useWorkshop } from "@/lib/workshop-store"
import type { HardwareProject, Part, PartCategory } from "@/lib/workshop-data"

const COVERS = [
  "/projects/plant-monitor.svg",
  "/projects/heart-badge.svg",
  "/projects/drone-controller.svg",
  "/projects/door-lock.svg",
  "/projects/weather-station.svg",
  "/projects/robotic-arm.svg",
]
const COLORS = ["#10b981", "#f43f5e", "#0ea5e9", "#f59e0b", "#f97316", "#8b5cf6"]

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

interface PartRow extends Part {}

export function NewProjectForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const { addProject } = useWorkshop()

  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [tags, setTags] = useState("")
  const [summary, setSummary] = useState("")
  const [cover, setCover] = useState(COVERS[0])
  const [parts, setParts] = useState<PartRow[]>([
    { name: "", category: "Electrical", subcategory: "MCU", quantity: 1, unitCost: 0 },
  ])
  const [wiring, setWiring] = useState("")
  const [mech, setMech] = useState("")
  const [instructions, setInstructions] = useState("")

  const addRow = () =>
    setParts((p) => [...p, { name: "", category: "Electrical", subcategory: "", quantity: 1, unitCost: 0 }])
  const updateRow = (i: number, patch: Partial<PartRow>) =>
    setParts((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const removeRow = (i: number) => setParts((p) => p.filter((_, idx) => idx !== i))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const slug = slugify(title) || `project-${Date.now()}`
    const project: HardwareProject = {
      slug,
      title: title.trim() || "Untitled project",
      author: author.trim() || "anonymous",
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      cover,
      createdAt: new Date().toISOString(),
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      summary: summary.trim(),
      parts: parts.filter((p) => p.name.trim()).map((p) => ({ ...p, unitCost: Number(p.unitCost) || 0, quantity: Number(p.quantity) || 1 })),
      wiring: wiring.trim(),
      mech: mech.trim(),
      instructions: instructions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      stars: 0,
    }
    addProject(project)
    router.push(`/workshop/${slug}`)
  }

  const field = (label: string): React.CSSProperties => ({
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
    margin: "0 0 6px",
  })
  const input: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 24px 80px" }}>
        <Link href="/workshop" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#2563eb", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
          <ArrowLeft size={16} /> {t("workshop.backToWorkshop")}
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "18px 0 4px" }}>{t("workshop.newProjectTitle")}</h1>
        <p style={{ color: "#475569", fontSize: 16, margin: "0 0 28px" }}>{t("workshop.newProjectSubtitle")}</p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <label style={field(t("workshop.projectTitle"))}>{t("workshop.projectTitle")}</label>
            <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("workshop.projectTitlePlaceholder")} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              <label style={field(t("workshop.projectAuthor"))}>{t("workshop.projectAuthor")}</label>
              <input style={input} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="your_handle" />
            </div>
            <div>
              <label style={field(t("workshop.tags"))}>{t("workshop.tags")}</label>
              <input style={input} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="IoT, Sensors" />
            </div>
          </div>

          <div>
            <label style={field(t("workshop.projectSummary"))}>{t("workshop.projectSummary")}</label>
            <input style={input} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={t("workshop.projectSummaryPlaceholder")} />
          </div>

          <div>
            <label style={field(t("workshop.cover"))}>{t("workshop.cover")}</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {COVERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCover(c)}
                  style={{
                    width: 88, height: 66, borderRadius: 12, overflow: "hidden", cursor: "pointer",
                    border: cover === c ? "3px solid #0f172a" : "2px solid #e2e8f0", padding: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ ...field(t("workshop.parts")), margin: 0 }}>{t("workshop.parts")}</label>
              <button type="button" onClick={addRow} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                <Plus size={14} /> {t("workshop.addPart")}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {parts.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2.4fr 1.3fr 1.3fr 0.9fr 1fr auto", gap: 8, alignItems: "center" }}>
                  <input style={{ ...input, padding: "9px 11px", fontSize: 14 }} value={row.name} onChange={(e) => updateRow(i, { name: e.target.value })} placeholder="Part name" />
                  <select style={{ ...input, padding: "9px 11px", fontSize: 14 }} value={row.category} onChange={(e) => updateRow(i, { category: e.target.value as PartCategory })}>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
                  <input style={{ ...input, padding: "9px 11px", fontSize: 14 }} value={row.subcategory} onChange={(e) => updateRow(i, { subcategory: e.target.value })} placeholder="Type" />
                  <input style={{ ...input, padding: "9px 11px", fontSize: 14 }} type="number" min={1} value={row.quantity} onChange={(e) => updateRow(i, { quantity: Number(e.target.value) })} />
                  <input style={{ ...input, padding: "9px 11px", fontSize: 14 }} type="number" step="0.01" min={0} value={row.unitCost} onChange={(e) => updateRow(i, { unitCost: Number(e.target.value) })} placeholder="$" />
                  <button type="button" onClick={() => removeRow(i)} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={15} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={field(t("workshop.tabWiring"))}>{t("workshop.tabWiring")}</label>
            <textarea style={{ ...input, minHeight: 90, resize: "vertical", fontFamily: "inherit" }} value={wiring} onChange={(e) => setWiring(e.target.value)} />
          </div>
          <div>
            <label style={field(t("workshop.tabMech"))}>{t("workshop.tabMech")}</label>
            <textarea style={{ ...input, minHeight: 90, resize: "vertical", fontFamily: "inherit" }} value={mech} onChange={(e) => setMech(e.target.value)} />
          </div>
          <div>
            <label style={field(t("workshop.tabInstructions"))}>{t("workshop.tabInstructions")}</label>
            <textarea style={{ ...input, minHeight: 110, resize: "vertical", fontFamily: "inherit" }} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="One step per line" />
          </div>

          <button
            type="submit"
            style={{
              alignSelf: "flex-start", padding: "13px 26px", borderRadius: 12, border: "none",
              background: "#0f172a", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer",
            }}
          >
            {t("workshop.publish")}
          </button>
        </form>
      </div>
    </main>
  )
}
