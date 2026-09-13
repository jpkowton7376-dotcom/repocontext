"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Star, Copy, Files, GitBranch, ListOrdered, ExternalLink, Check } from "lucide-react"
import { SiteNav } from "@/components/SiteNav"
import { useTranslation } from "@/components/LanguageProvider"
import { useCommunity } from "@/lib/community-store"
import {
  CATEGORY_MAP,
  FORMAT_LABELS,
  FORMAT_COLORS,
  timeAgo,
  formatCount,
  initials,
  Project,
  ProjectFile,
} from "@/lib/community-data"

type TabKey = "info" | "files" | "structure" | "instructions"

export function ProjectDetail({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const { projects, getProject, star, isStarred, hydrated } = useCommunity()
  const [tab, setTab] = useState<TabKey>("info")
  const project = getProject(slug)

  const related = useMemo(() => {
    if (!project) return []
    return projects.filter((p) => p.category === project.category && p.id !== project.id).slice(0, 3)
  }, [projects, project])

  if (hydrated && !project) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
        <SiteNav variant="light" />
        <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "80px 24px" }}>
          <h1 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "32px", fontWeight: 300, margin: 0 }}>
            {t("community.projectNotFound")}
          </h1>
          <Link href="/community" className="btn-primary">
            {t("community.backToCommunity")}
          </Link>
        </section>
      </main>
    )
  }

  if (!project) {
    return (
      <main style={{ minHeight: "100vh", background: "white" }}>
        <SiteNav variant="light" />
      </main>
    )
  }

  const cat = CATEGORY_MAP[project.category]
  const starred = isStarred(project.id)

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      <SiteNav variant="light" />

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--rule)", background: "linear-gradient(180deg, #f6f8fb 0%, white 100%)" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "32px 48px 0" }}>
          <Link
            href="/community"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "var(--muted)", textDecoration: "none", marginBottom: "20px" }}
          >
            <ArrowLeft size={16} /> {t("community.backToCommunity")}
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", marginBottom: "20px" }}>
            <div style={{ maxWidth: "780px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: cat.color,
                    background: `${cat.color}14`,
                    padding: "3px 9px",
                    borderRadius: "4px",
                  }}
                >
                  {cat.label}
                </span>
                {project.formats.map((fmt) => (
                  <span
                    key={fmt}
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: FORMAT_COLORS[fmt],
                      background: `${FORMAT_COLORS[fmt]}14`,
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {FORMAT_LABELS[fmt]}
                  </span>
                ))}
              </div>

              <h1
                style={{
                  fontFamily: "'IBM Plex Serif', Georgia, serif",
                  fontSize: "36px",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                  margin: "0 0 14px",
                  color: "var(--ink)",
                }}
              >
                {project.title}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: project.author.avatarColor,
                    color: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {initials(project.author.name)}
                </span>
                <span style={{ fontSize: "14px", color: "var(--ink-2)" }}>
                  <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{project.author.name}</strong>
                  {project.author.role && <span style={{ color: "var(--muted-2)" }}> · {project.author.role}</span>}
                  <span style={{ color: "var(--muted-2)" }}> · {timeAgo(project.createdAt)}</span>
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => star(project.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: starred ? "#0f62fe" : "var(--bg-cool)",
                  color: starred ? "white" : "var(--ink)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Star size={16} fill={starred ? "currentColor" : "none"} /> {formatCount(project.stars)}
              </button>
              <CopyAllButton files={project.files} t={t} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px" }}>
            <TabButton active={tab === "info"} onClick={() => setTab("info")} icon={<ListOrdered size={15} />}>
              {t("community.tabInfo")}
            </TabButton>
            <TabButton active={tab === "files"} onClick={() => setTab("files")} icon={<Files size={15} />}>
              {t("community.tabFiles")}
            </TabButton>
            <TabButton active={tab === "structure"} onClick={() => setTab("structure")} icon={<GitBranch size={15} />}>
              {t("community.tabStructure")}
            </TabButton>
            <TabButton active={tab === "instructions"} onClick={() => setTab("instructions")} icon={<ListOrdered size={15} />}>
              {t("community.tabInstructions")}
            </TabButton>
          </div>
        </div>
      </header>

      {/* Tab content */}
      <section style={{ flex: 1, maxWidth: "1180px", width: "100%", margin: "0 auto", padding: "40px 48px 96px", boxSizing: "border-box" }}>
        {tab === "info" && <InfoTab project={project} t={t} />}
        {tab === "files" && <FilesTab files={project.files} t={t} />}
        {tab === "structure" && <StructureTab structure={project.structure} t={t} />}
        {tab === "instructions" && <InstructionsTab instructions={project.instructions} t={t} />}

        {/* Related */}
        {related.length > 0 && (
          <section style={{ marginTop: "64px", borderTop: "1px solid var(--rule)", paddingTop: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 18px" }}>{t("community.relatedTitle")}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/community/${r.slug}`}
                  style={{ display: "block", padding: "16px", border: "1px solid var(--rule)", borderRadius: "10px", textDecoration: "none", color: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c1c7cd")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--rule)")}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: CATEGORY_MAP[r.category].color }}>
                    {CATEGORY_MAP[r.category].label}
                  </span>
                  <h3 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "17px", fontWeight: 400, margin: "6px 0 4px", color: "var(--ink)" }}>
                    {r.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>{r.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>

      <footer style={{ borderTop: "1px solid var(--rule)", padding: "32px 48px", background: "white" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "var(--muted-2)" }}>
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

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "12px 18px",
        border: "none",
        borderBottom: active ? "2px solid var(--ink)" : "2px solid transparent",
        background: "transparent",
        color: active ? "var(--ink)" : "var(--muted)",
        fontSize: "13px",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {icon} {children}
    </button>
  )
}

function InfoTab({ project, t }: { project: Project; t: (key: string) => string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "48px", alignItems: "start" }}>
      <div style={{ position: "relative", aspectRatio: "16 / 10", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--rule)" }}>
        <Image src={project.cover} alt={project.title} fill style={{ objectFit: "cover" }} />
      </div>
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 12px" }}>{t("community.aiSummary")}</h2>
        <p style={{ fontSize: "16px", lineHeight: 1.7, color: "var(--ink-2)", margin: "0 0 24px", whiteSpace: "pre-line" }}>
          {project.description}
        </p>

        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "var(--blue-60)", textDecoration: "none", marginBottom: "24px" }}
          >
            <ExternalLink size={14} /> {t("community.viewRepo")}
          </a>
        )}

        <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 12px" }}>{t("community.parts")}</h3>
        <div style={{ border: "1px solid var(--rule)", borderRadius: "8px", overflow: "hidden" }}>
          {project.parts.map((part, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: i < project.parts.length - 1 ? "1px solid var(--rule)" : "none",
                background: i % 2 === 0 ? "white" : "var(--bg-cool)",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>{part.name}</div>
                {part.description && <div style={{ fontSize: "12px", color: "var(--muted)" }}>{part.description}</div>}
              </div>
              <div style={{ fontSize: "13px", color: "var(--muted)", textAlign: "right" }}>
                <div>{part.category}</div>
                {part.count !== undefined && <div>x{part.count}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FilesTab({ files, t }: { files: ProjectFile[]; t: (key: string) => string }) {
  const [query, setQuery] = useState("")
  const filtered = files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("community.searchFiles")}
          style={{
            flex: 1,
            maxWidth: "360px",
            padding: "10px 14px",
            border: "1px solid var(--rule)",
            borderRadius: "6px",
            fontSize: "14px",
            fontFamily: "inherit",
            color: "var(--ink)",
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filtered.map((f) => (
          <FileCard key={f.name} file={f} t={t} />
        ))}
      </div>
    </div>
  )
}

function FileCard({ file, t }: { file: ProjectFile; t: (key: string) => string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(file.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: "10px", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "var(--bg-cool)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: FORMAT_COLORS[file.format],
              background: `${FORMAT_COLORS[file.format]}14`,
              padding: "3px 8px",
              borderRadius: "4px",
            }}
          >
            {FORMAT_LABELS[file.format]}
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)", fontFamily: "'IBM Plex Mono', monospace" }}>{file.name}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "7px 12px",
            border: "1px solid var(--rule)",
            borderRadius: "5px",
            background: "white",
            color: "var(--ink-2)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? t("community.copied") : t("community.copy")}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "16px",
          fontSize: "13px",
          lineHeight: 1.6,
          background: "#0a0a0a",
          color: "#e8e8e8",
          overflowX: "auto",
          fontFamily: "'IBM Plex Mono', monospace",
          maxHeight: "360px",
          overflow: "auto",
        }}
      >
        <code>{file.content}</code>
      </pre>
    </div>
  )
}

function StructureTab({ structure, t }: { structure: string[]; t: (key: string) => string }) {
  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: "10px", padding: "24px", background: "var(--bg-cool)" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 16px" }}>{t("community.repoStructure")}</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", lineHeight: 1.8, color: "var(--ink-2)" }}>
        {structure.map((path, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <GitBranch size={14} color="var(--muted-2)" />
            {path.endsWith("/") ? `📁 ${path}` : `📄 ${path}`}
          </li>
        ))}
      </ul>
    </div>
  )
}

function InstructionsTab({ instructions, t }: { instructions: Project["instructions"]; t: (key: string) => string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {instructions.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--blue-60)",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 600, margin: "0 0 8px" }}>{step.title}</h3>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--ink-2)", lineHeight: 1.7 }}>
              {step.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}

function CopyAllButton({ files, t }: { files: ProjectFile[]; t: (key: string) => string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      const text = files.map((f) => `<!-- ${f.name} -->\n${f.content}`).join("\n\n")
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "10px 16px",
        borderRadius: "6px",
        border: "1px solid var(--rule)",
        background: "white",
        color: "var(--ink)",
        fontSize: "14px",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? t("community.copied") : t("community.copyAll")}
    </button>
  )
}
