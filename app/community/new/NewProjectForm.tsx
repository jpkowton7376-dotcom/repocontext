"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { SiteNav } from "@/components/SiteNav"
import { useTranslation } from "@/components/LanguageProvider"
import { useCommunity } from "@/lib/community-store"
import { CATEGORIES, CategoryId, ContextFormat, FORMAT_LABELS } from "@/lib/community-data"

export function NewProjectForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const { addProject, hydrated } = useCommunity()

  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [category, setCategory] = useState<CategoryId>("showcase")
  const [tags, setTags] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [structure, setStructure] = useState("README.md\nsrc/\n")
  const [instructions, setInstructions] = useState("Copy the files\nPlace them at the repo root\n\nCustomize\nEdit names and URLs to match your project")
  const [files, setFiles] = useState<{ name: string; format: ContextFormat; content: string }[]>([
    { name: "AGENTS.md", format: "agents", content: "" },
  ])
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = hydrated && title.trim().length > 0 && summary.trim().length > 0 && files.some((f) => f.name.trim() && f.content.trim())

  const addFile = () => setFiles((prev) => [...prev, { name: "", format: "custom", content: "" }])
  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i))
  const updateFile = (i: number, patch: Partial<{ name: string; format: ContextFormat; content: string }>) =>
    setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))

  const parseInstructions = (raw: string): { title: string; items: string[] }[] => {
    const steps: { title: string; items: string[] }[] = []
    let current: { title: string; items: string[] } | null = null
    raw.split("\n").forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed) return
      if (/^\d+\.\s*/.test(trimmed) || /^#\s*/.test(trimmed)) {
        const title = trimmed.replace(/^\d+\.\s*/, "").replace(/^#\s*/, "")
        current = { title, items: [] }
        steps.push(current)
      } else if (current) {
        current.items.push(trimmed.replace(/^[-*]\s*/, ""))
      }
    })
    return steps.length ? steps : [{ title: "Use this project", items: ["Copy the files into your repo."] }]
  }

  const submit = () => {
    if (!canSubmit) return
    setSubmitting(true)
    const parsedTags = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6)
    const parsedFiles = files.filter((f) => f.name.trim() && f.content.trim())
    const slug = addProject({
      title,
      summary,
      description: description || summary,
      repoUrl,
      category,
      tags: parsedTags,
      files: parsedFiles,
      structure: structure
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      instructions: parseInstructions(instructions),
      authorName,
    })
    if (slug) router.push(`/community/${slug}`)
    else setSubmitting(false)
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      <SiteNav variant="light" />

      <div style={{ maxWidth: "760px", width: "100%", margin: "0 auto", padding: "40px 24px 96px", boxSizing: "border-box" }}>
        <button
          type="button"
          onClick={() => router.push("/community")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", marginBottom: "24px" }}
        >
          <ArrowLeft size={16} /> {t("community.backToCommunity")}
        </button>

        <div style={{ width: "48px", height: "4px", background: "var(--blue-60)", marginBottom: "20px" }} />
        <h1 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: "38px", fontWeight: 300, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          {t("community.newProjectTitle")}
        </h1>
        <p style={{ fontSize: "16px", color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 36px" }}>
          {t("community.newProjectSubtitle")}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <Field label={t("community.projectTitle")}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("community.projectTitlePlaceholder")} style={inputStyle} />
          </Field>

          <Field label={t("community.projectSummary")}>
            <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={t("community.projectSummaryPlaceholder")} style={inputStyle} />
          </Field>

          <Field label={t("community.projectDescription")}>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("community.projectDescriptionPlaceholder")} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <Field label={t("community.projectRepoUrl")}>
            <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder={t("community.projectRepoUrlPlaceholder")} style={inputStyle} />
          </Field>

          <Field label={t("community.projectCategory")}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: category === c.id ? `1px solid ${c.color}` : "1px solid var(--rule)",
                    background: category === c.id ? `${c.color}14` : "white",
                    color: category === c.id ? c.color : "var(--ink-2)",
                    fontSize: "13px",
                    fontWeight: category === c.id ? 600 : 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label={t("community.projectTags")}>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t("community.projectTagsPlaceholder")} style={inputStyle} />
          </Field>

          <Field label={t("community.projectFiles")}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {files.map((f, i) => (
                <div key={i} style={{ border: "1px solid var(--rule)", borderRadius: "8px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      value={f.name}
                      onChange={(e) => updateFile(i, { name: e.target.value })}
                      placeholder={t("community.fileNamePlaceholder")}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <select
                      value={f.format}
                      onChange={(e) => updateFile(i, { format: e.target.value as ContextFormat })}
                      style={{ ...inputStyle, width: "auto", minWidth: "140px" }}
                    >
                      {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      disabled={files.length === 1}
                      style={{ padding: "10px", border: "1px solid var(--rule)", borderRadius: "6px", background: "white", cursor: files.length === 1 ? "not-allowed" : "pointer" }}
                    >
                      <Trash2 size={16} color={files.length === 1 ? "var(--muted-2)" : "#da1e28"} />
                    </button>
                  </div>
                  <textarea
                    value={f.content}
                    onChange={(e) => updateFile(i, { content: e.target.value })}
                    placeholder={t("community.fileContentPlaceholder")}
                    rows={6}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px" }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addFile}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 14px", border: "1px dashed var(--rule)", borderRadius: "6px", background: "white", color: "var(--blue-60)", fontSize: "14px", cursor: "pointer", alignSelf: "flex-start" }}
              >
                <Plus size={16} /> {t("community.addFile")}
              </button>
            </div>
          </Field>

          <Field label={t("community.projectStructure")}>
            <textarea value={structure} onChange={(e) => setStructure(e.target.value)} placeholder={t("community.projectStructurePlaceholder")} rows={5} style={{ ...inputStyle, resize: "vertical", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px" }} />
          </Field>

          <Field label={t("community.projectInstructions")}>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder={t("community.projectInstructionsPlaceholder")} rows={6} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <Field label={t("community.authorName")}>
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder={t("community.authorNamePlaceholder")} style={inputStyle} />
          </Field>

          <div>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || submitting}
              style={{
                padding: "13px 28px",
                background: canSubmit && !submitting ? "var(--blue-60)" : "#c1c7cd",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "15px",
                fontWeight: 500,
                cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
              }}
            >
              {submitting ? t("community.publishing") : t("community.publish")}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid var(--rule)",
  borderRadius: "6px",
  fontSize: "15px",
  fontFamily: "inherit",
  color: "var(--ink)",
  background: "white",
  outline: "none",
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink)", marginBottom: "8px" }}>{label}</label>
      {children}
    </div>
  )
}
