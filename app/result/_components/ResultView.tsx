"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────────── */

interface RepoInfo {
  owner: string
  repo: string
  fullName: string
  description: string
  language: string
  stars: number
  url: string
  defaultBranch?: string
  isPrivate?: boolean
}

interface RepoFacts {
  framework: string | null
  packageManager: string | null
  buildTool: string | null
  testFramework: string | null
  devCommand: string | null
  buildCommand: string | null
  testCommand: string | null
  lintCommand: string | null
  testDir: string | null
  srcDir: string | null
  hasDocker: boolean
  hasCi: boolean
  hasAgentsMd: boolean
  hasReadme?: boolean
  isMonorepo?: boolean
  monorepoDirs?: string[]
}

interface QualityInfo {
  score: number
  verified: number
  total: number
  details: { label: string; verified: boolean }[]
}

interface EvidenceItem {
  field: string
  label: string
  value: string | null
  source: string | null
  sourceDetail?: string
  verified: boolean
}

interface AuditIssue {
  severity: "critical" | "warning" | "info"
  category: "missing" | "outdated" | "incomplete"
  title: string
  detail: string
  fix: string
}

interface AuditResult {
  hasIssues: boolean
  score: number
  issues: AuditIssue[]
  suggestions: string[]
  hasExisting: boolean
}

type FormatKey = "agentsMd" | "claudeMd" | "cursorRules" | "copilotInstructions"

export interface ResultData {
  repo: RepoInfo
  facts: RepoFacts
  formats: Record<FormatKey, string>
  agentsMd: string
  quality: QualityInfo
  audit: AuditResult
  evidence: EvidenceItem[]
  /** Original AGENTS.md content found in the repo, if any. */
  existingAgentsMd?: string | null
  usedLLM: boolean
  hasExistingAgentsMd: boolean
}

/* ────────────────────────────────────────────────────────────────────────────
 * Inline icons (stroke style matches the rest of the site)
 * ──────────────────────────────────────────────────────────────────────────── */

const CopyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const DownloadIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const ShareIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const FORMATS: Array<{
  key: FormatKey
  label: string
  description: string
  filename: string
  href: string
}> = [
  { key: "agentsMd",            label: "AGENTS.md",             description: "Cross-tool agent context",             filename: "AGENTS.md",                          href: "https://agents.md" },
  { key: "claudeMd",            label: "CLAUDE.md",             description: "Optimized for Claude",                 filename: "CLAUDE.md",                          href: "https://docs.anthropic.com/en/docs/claude-code/overview" },
  { key: "cursorRules",         label: "Cursor Rules",          description: "Rules for Cursor IDE",                 filename: ".cursorrules",                       href: "https://docs.cursor.com/context/rules" },
  { key: "copilotInstructions", label: "Copilot Instructions",  description: "Repository-level guidance",            filename: ".github/copilot-instructions.md",    href: "https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot" },
]

/* ────────────────────────────────────────────────────────────────────────────
 * View
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Shared view component. Receives an optional preloaded payload so the same
 * UI can be rendered from the main analysis flow (via sessionStorage) or a
 * shared link (loaded from /api/share).
 */
type ResultViewProps = {
  initialData?: ResultData | null
  repoUrl?: string
}

export default function ResultView({ initialData, repoUrl }: ResultViewProps) {
  const [data, setData] = useState<ResultData | null>(initialData ?? null)
  const [copied, setCopied] = useState(false)
  const [showEvidence, setShowEvidence] = useState(false)
  const [formatKey, setFormatKey] = useState<FormatKey>("agentsMd")
  const [showCompare, setShowCompare] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [shareBusy, setShareBusy] = useState(false)
  const [shareError, setShareError] = useState("")
  const router = useRouter()

  useEffect(() => {
    setData(initialData ?? null)
  }, [initialData])

  const currentContent = useMemo(() => {
    if (!data) return ""
    return data.formats?.[formatKey] ?? data.agentsMd ?? ""
  }, [data, formatKey])

  const currentFormat = useMemo(() => FORMATS.find((f) => f.key === formatKey)!, [formatKey])

  const handleCopy = async () => {
    if (!currentContent) return
    await navigator.clipboard.writeText(currentContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!currentContent) return
    const blob = new Blob([currentContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = currentFormat.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (!data) return
    setShareBusy(true)
    setShareError("")
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: data }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || d.error) {
        setShareError(d.error || "Failed to create share link")
        return
      }
      const url = `${window.location.origin}/result/${d.id}`
      setShareUrl(url)
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        // Clipboard may be blocked; the URL is still shown below so it can be copied manually.
      }
    } catch (err: any) {
      setShareError(err.message || "Failed to create share link")
    } finally {
      setShareBusy(false)
    }
  }

  const handleDownloadAll = () => {
    if (!data) return
    // 简化：分别触发 4 个下载
    FORMATS.forEach((fmt) => {
      const content = data.formats?.[fmt.key]
      if (!content) return
      const blob = new Blob([content], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fmt.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  }

  if (!data) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-cool)",
      }}>
        <div style={{ color: "var(--muted)", fontSize: "16px" }}>Loading...</div>
      </div>
    )
  }

  const { repo, facts, quality, audit, evidence, usedLLM, hasExistingAgentsMd } = data

  const scoreLabel =
    quality.score >= 80 ? "Excellent" : quality.score >= 60 ? "Good" : "Needs work"
  const scoreColor =
    quality.score >= 80 ? "var(--green-50)" : quality.score >= 60 ? "var(--orange-50)" : "var(--red-50)"

  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (quality.score / 100) * circumference

  const issueColor = (sev: AuditIssue["severity"]) =>
    sev === "critical" ? "#dc2626" : sev === "warning" ? "#f59e0b" : "#3b82f6"

  const issueBg = (sev: AuditIssue["severity"]) =>
    sev === "critical" ? "rgba(220, 38, 38, 0.06)" : sev === "warning" ? "rgba(245, 158, 11, 0.06)" : "rgba(59, 130, 246, 0.05)"

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-warm)" }}>
      {/* Nav */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: "64px",
        borderBottom: "1px solid var(--rule)",
        background: "white",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <button
          onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: "12px", border: "none", background: "none", cursor: "pointer", padding: 0 }}
        >
          <div style={{ width: "36px", height: "36px", position: "relative" }}>
            <Image
              src="/logo-dark.png"
              alt="RepoContext"
              fill
              sizes="36px"
              style={{ objectFit: "contain", backgroundColor: "transparent" }}
              quality={95}
            />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>
            RepoContext
          </span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {usedLLM && (
            <span style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--blue-70)",
              background: "var(--blue-10)",
              padding: "6px 12px",
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.02em",
            }}>
              LLM-ENHANCED
            </span>
          )}
          <button
            onClick={() => router.push("/")}
            style={{
              fontSize: "14px",
              padding: "10px 20px",
              background: "transparent",
              border: "2px solid var(--ink)",
              color: "var(--ink)",
              cursor: "pointer",
              fontWeight: 500,
              letterSpacing: "0.02em",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--ink)"
              e.currentTarget.style.color = "white"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "var(--ink)"
            }}
          >
            ← New analysis
          </button>
        </div>
      </nav>

      {/* Result content */}
      <div style={{ flex: 1, maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "48px" }}>
        {/* Breadcrumb */}
        <div style={{
          fontSize: "13px",
          color: "var(--muted)",
          marginBottom: "16px",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          Analysis / <span style={{ color: "var(--ink)" }}>{repo.fullName}</span>
        </div>

        {/* Repo header + quality */}
        <div style={{
          background: "white",
          border: "1px solid var(--rule)",
          padding: "40px",
          marginBottom: "32px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "48px",
          alignItems: "start",
        }}>
          <div>
            <div style={{ width: "48px", height: "4px", background: "var(--blue-60)", marginBottom: "24px" }} />
            <div style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "12px",
            }}>
              Repository analysis complete
            </div>
            <h1 style={{
              fontFamily: "'IBM Plex Serif', Georgia, serif",
              fontSize: "36px",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              margin: "0 0 8px 0",
            }}>
              {repo.fullName}
            </h1>
            {repo.description && (
              <p style={{ fontSize: "16px", color: "var(--ink-2)", margin: "0 0 16px 0", maxWidth: "600px", lineHeight: 1.6 }}>
                {repo.description}
              </p>
            )}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              {repo.language && (
                <span style={{
                  fontSize: "13px", padding: "4px 12px",
                  background: "var(--bg-cool)", color: "var(--ink-2)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>{repo.language}</span>
              )}
              {repo.stars != null && (
                <span style={{
                  fontSize: "13px", padding: "4px 12px",
                  background: "var(--bg-cool)", color: "var(--ink-2)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>⭐ {repo.stars.toLocaleString()}</span>
              )}
              {repo.isPrivate && (
                <span style={{
                  fontSize: "13px", padding: "4px 12px",
                  background: "rgba(245, 158, 11, 0.14)", color: "#a16207",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>🔒 Private</span>
              )}
              {facts.hasDocker && (
                <span style={{
                  fontSize: "13px", padding: "4px 12px",
                  background: "var(--blue-10)", color: "var(--blue-70)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>Docker</span>
              )}
              {facts.hasCi && (
                <span style={{
                  fontSize: "13px", padding: "4px 12px",
                  background: "var(--purple-50)", color: "white",
                  fontFamily: "'IBM Plex Mono', monospace",
                  opacity: 0.8,
                }}>CI/CD</span>
              )}
              {facts.isMonorepo && (
                <span
                  title={
                    facts.monorepoDirs?.length
                      ? `Workspace directories: ${facts.monorepoDirs.join(", ")}`
                      : "Monorepo layout detected"
                  }
                  style={{
                    fontSize: "13px", padding: "4px 12px",
                    background: "rgba(139, 92, 246, 0.14)", color: "#6d28d9",
                    fontFamily: "'IBM Plex Mono', monospace",
                    cursor: "help",
                  }}
                >
                  Monorepo{facts.monorepoDirs?.length ? ` · ${facts.monorepoDirs.join(", ")}` : ""}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener"
                style={{
                  fontSize: "14px",
                  color: "var(--blue-60)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--blue-60)",
                  paddingBottom: "1px",
                  fontWeight: 500,
                }}
              >
                View on GitHub →
              </a>
              {repo.isPrivate && (
                <Link
                  href="/dashboard"
                  style={{
                    fontSize: "13px",
                    color: "var(--orange-50, #a16207)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  🔒 Private repo? Connect GitHub in Dashboard →
                </Link>
              )}
            </div>
          </div>

          {/* Quality score card */}
          <div style={{
            minWidth: "240px",
            padding: "28px",
            background: "var(--bg-cool)",
            border: "1px solid var(--rule)",
          }}>
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "20px",
            }}>
              Quality Score
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <div style={{ position: "relative", width: "88px", height: "88px" }}>
                <svg width="88" height="88" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r={radius} stroke="var(--rule-2)" strokeWidth="6" fill="none" />
                  <circle
                    cx="50" cy="50" r={radius}
                    stroke={scoreColor} strokeWidth="6" fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" style={{ transition: "all 0.7s ease" }}
                  />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontFamily: "'IBM Plex Serif', serif",
                    fontSize: "28px", fontWeight: 300, color: scoreColor, lineHeight: 1,
                  }}>{quality.score}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>{scoreLabel}</div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                  {quality.verified} of {quality.total} verified
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              style={{
                width: "100%", padding: "10px",
                background: "transparent",
                border: "1px solid var(--rule)",
                fontSize: "13px", fontWeight: 500,
                cursor: "pointer", color: "var(--blue-60)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--blue-10)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            >
              {showEvidence ? "Hide details ↑" : "View evidence →"}
            </button>
          </div>
        </div>

        {/* Evidence panel — real per-claim source attribution */}
        {showEvidence && (
          <div style={{
            background: "white",
            border: "1px solid var(--rule)",
            padding: "32px 40px",
            marginBottom: "32px",
          }}>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{
                fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "var(--muted)",
                margin: "0 0 8px 0",
              }}>Evidence</h3>
              <p style={{ fontSize: "14px", color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
                Every detected fact is attributed to the file that produced it. If a fact has no source, it's an inference.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1px",
              background: "var(--rule)",
              border: "1px solid var(--rule)",
            }}>
              {evidence.map((it) => (
                <div
                  key={it.field}
                  style={{
                    background: "white",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: it.verified ? "var(--green-50)" : "var(--red-50)",
                    color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700, flexShrink: 0, marginTop: "1px",
                  }}>
                    {it.verified ? "✓" : "·"}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{it.label}</span>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "12px",
                        color: it.verified ? "var(--ink-2)" : "var(--muted)",
                        wordBreak: "break-word",
                      }}>{it.value ?? "—"}</span>
                    </div>
                    <div style={{
                      marginTop: "4px",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "11px",
                      color: it.source ? "var(--blue-60)" : "var(--muted)",
                    }}>
                      {it.source ? (
                        it.source.startsWith("http") ? (
                          <a href={it.source} target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "underline" }}>
                            {it.source}
                          </a>
                        ) : (
                          <>
                            <span style={{ opacity: 0.6 }}>from </span>
                            <span style={{ color: "var(--blue-60)" }}>{it.source}</span>
                            {it.sourceDetail && <span style={{ opacity: 0.6 }}> · {it.sourceDetail}</span>}
                          </>
                        )
                      ) : "no source — inferred"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENTS.md Audit panel — replaces the old "consider running an audit" placeholder */}
        {audit.hasExisting === false && (
          <div style={{
            padding: "24px 28px",
            background: issueBg("critical"),
            borderLeft: `4px solid ${issueColor("critical")}`,
            marginBottom: "32px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", padding: "4px 10px",
                background: issueColor("critical"), color: "white", borderRadius: "3px",
              }}>Audit</span>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>Just now</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 6px 0", color: "var(--ink)" }}>
              This repository has no AGENTS.md
            </h3>
            <p style={{ fontSize: "14px", color: "var(--ink-2)", margin: "0 0 12px 0", lineHeight: 1.6 }}>
              The canonical agent-context file is missing at the repository root. AI coding agents will fall back to guessing.
            </p>
            <p style={{ fontSize: "14px", color: "var(--green-50, #16a34a)", margin: 0, fontWeight: 500 }}>
              ✓ Use the generated file below — it's based on verified facts from your codebase.
            </p>
          </div>
        )}

        {audit.hasExisting && audit.hasIssues && (
          <div style={{
            background: "white",
            border: "1px solid var(--rule)",
            padding: "32px 40px",
            marginBottom: "32px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", padding: "4px 10px",
                background: audit.score >= 80 ? "var(--green-50, #16a34a)" : audit.score >= 50 ? "rgba(245, 158, 11, 0.18)" : "rgba(220, 38, 38, 0.18)",
                color: audit.score >= 80 ? "white" : audit.score >= 50 ? "#a16207" : "#dc2626",
                borderRadius: "3px",
              }}>Audit · {audit.score}/100</div>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                {audit.issues.length} issue{audit.issues.length > 1 ? "s" : ""} found in existing AGENTS.md
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {audit.issues.map((iss, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 18px",
                    background: issueBg(iss.severity),
                    borderLeft: `3px solid ${issueColor(iss.severity)}`,
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: issueColor(iss.severity),
                    }}>
                      {iss.severity}
                    </span>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)" }}>{iss.title}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--ink-2)", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                    {iss.detail}
                  </p>
                  <p style={{
                    fontSize: "13px", margin: 0, lineHeight: 1.5,
                    color: "var(--green-50, #16a34a)", fontWeight: 500,
                  }}>
                    Fix: {iss.fix}
                  </p>
                </div>
              ))}
            </div>
            {audit.suggestions.length > 0 && (
              <div style={{
                marginTop: "20px", paddingTop: "20px",
                borderTop: "1px solid var(--rule)",
                display: "flex", flexDirection: "column", gap: "6px",
              }}>
                {audit.suggestions.map((s, i) => (
                  <p key={i} style={{ fontSize: "13px", color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
                    • {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {audit.hasExisting && !audit.hasIssues && (
          <div style={{
            padding: "20px 28px",
            background: "rgba(22, 163, 74, 0.08)",
            borderLeft: "4px solid var(--green-50, #16a34a)",
            marginBottom: "32px",
          }}>
            <p style={{ fontSize: "14px", color: "#14532d", margin: 0, lineHeight: 1.6 }}>
              <strong>✓ Your existing AGENTS.md is comprehensive.</strong>{" "}
              Re-run analysis after major project changes to keep it current.
            </p>
          </div>
        )}

        {/* Format switcher tabs */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--rule)",
          marginBottom: "0",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {showCompare ? (
              <div style={{
                padding: "14px 18px",
                fontSize: "13px",
                color: "var(--ink-2)",
                fontFamily: "'IBM Plex Mono', monospace",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span style={{ color: "var(--blue-60)" }}>⇄</span>
                Comparing existing vs generated <strong style={{ fontWeight: 600 }}>AGENTS.md</strong>
              </div>
            ) : (
              FORMATS.map((fmt) => (
                <button
                  key={fmt.key}
                  onClick={() => setFormatKey(fmt.key)}
                  style={{
                    padding: "14px 18px",
                    background: "transparent",
                    border: "none",
                    borderBottom: fmt.key === formatKey ? "2px solid var(--ink)" : "2px solid transparent",
                    color: fmt.key === formatKey ? "var(--ink)" : "var(--muted)",
                    fontSize: "14px",
                    fontWeight: fmt.key === formatKey ? 600 : 500,
                    cursor: "pointer",
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {fmt.label}
                </button>
              ))
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace" }}>
            <span>{currentContent.split("\n").length} lines</span>
            {data.existingAgentsMd && (
              <button
                onClick={() => {
                  // Compare always contrasts the canonical AGENTS.md, so snap back to it.
                  if (!showCompare) setFormatKey("agentsMd")
                  setShowCompare(!showCompare)
                }}
                style={{
                  padding: "6px 14px",
                  background: showCompare ? "var(--ink)" : "transparent",
                  color: showCompare ? "white" : "var(--ink-2)",
                  border: "1px solid var(--rule)",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.02em",
                  transition: "all 0.15s ease",
                }}
              >
                {showCompare ? "✕ Exit compare" : "⇄ Compare with existing"}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0", flexWrap: "wrap", marginBottom: "0" }}>
          <button
            onClick={handleCopy}
            style={{
              padding: "14px 28px",
              background: "var(--blue-60)",
              color: "white",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--blue-70)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--blue-60)" }}
          >
            {copied ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckIcon /> Copied to clipboard
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CopyIcon /> Copy {currentFormat.label}
              </span>
            )}
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: "13px 28px",
              background: "white",
              color: "var(--ink)",
              border: "2px solid var(--ink)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--ink)"
              e.currentTarget.style.color = "white"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white"
              e.currentTarget.style.color = "var(--ink)"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <DownloadIcon /> Download {currentFormat.filename}
            </span>
          </button>
          <button
            onClick={handleDownloadAll}
            title="Download all 4 formats"
            style={{
              padding: "13px 22px",
              background: "transparent",
              color: "var(--ink-2)",
              border: "1px solid var(--rule)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-cool)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <DownloadIcon /> Download all 4 formats
            </span>
          </button>
          <button
            onClick={handleShare}
            disabled={shareBusy}
            title="Create a public share link"
            style={{
              padding: "13px 22px",
              background: "transparent",
              color: shareBusy ? "var(--muted)" : "var(--ink-2)",
              border: "1px solid var(--rule)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: shareBusy ? "not-allowed" : "pointer",
              letterSpacing: "0.02em",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!shareBusy) e.currentTarget.style.background = "var(--bg-cool)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            {shareBusy ? (
              "Creating link…"
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShareIcon /> Share
              </span>
            )}
          </button>
        </div>

        {/* Share result / error */}
        {(shareUrl || shareError) && (
          <div style={{
            padding: "14px 20px",
            background: shareError ? "rgba(220, 38, 38, 0.06)" : "rgba(22, 163, 74, 0.07)",
            border: `1px solid ${shareError ? "rgba(220, 38, 38, 0.25)" : "rgba(22, 163, 74, 0.25)"}`,
            borderTop: "none",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}>
            {shareError ? (
              <span style={{ color: "#b91c1c", lineHeight: 1.5 }}>{shareError}</span>
            ) : (
              <>
                <span style={{ color: "#15803d", fontWeight: 600 }}>✓ Link copied</span>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "12px",
                    color: "var(--blue-60)",
                    textDecoration: "none",
                    wordBreak: "break-all",
                  }}
                >
                  {shareUrl}
                </a>
              </>
            )}
          </div>
        )}

        {/* Format description + filename hint */}
        <div style={{
          padding: "10px 20px",
          background: "var(--bg-cool)",
          borderLeft: "1px solid var(--rule)",
          borderRight: "1px solid var(--rule)",
          fontSize: "12px",
          color: "var(--muted)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>
            <strong style={{ color: "var(--ink-2)" }}>{currentFormat.label}.</strong>{" "}
            {currentFormat.description}.
          </span>
          <a
            href={currentFormat.href}
            target="_blank"
            rel="noopener"
            style={{ color: "var(--blue-60)", textDecoration: "none", fontWeight: 500 }}
          >
            Spec ↗
          </a>
        </div>

        {/* Side-by-side compare view: existing AGENTS.md vs generated */}
        {showCompare && data.existingAgentsMd && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "var(--rule)",
            border: "1px solid var(--rule)",
            borderTop: "none",
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                padding: "12px 20px",
                background: "#2a1f0a",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                fontSize: "12px",
                color: "#f0b429",
                fontFamily: "'IBM Plex Mono', monospace",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}>
                <span>Existing AGENTS.md</span>
                <span style={{ opacity: 0.6, fontSize: "11px" }}>
                  {data.existingAgentsMd.split("\n").length} lines
                </span>
              </div>
              <pre style={{
                margin: 0,
                padding: "20px",
                background: "#060f1f",
                fontSize: "12px",
                fontFamily: "'IBM Plex Mono', 'SF Mono', Consolas, monospace",
                color: "#c9d1d9",
                lineHeight: 1.6,
                maxHeight: "520px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                <code>{data.existingAgentsMd}</code>
              </pre>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                padding: "12px 20px",
                background: "#0a2a14",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                fontSize: "12px",
                color: "#3fb950",
                fontFamily: "'IBM Plex Mono', monospace",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}>
                <span>Generated AGENTS.md</span>
                <span style={{ opacity: 0.6, fontSize: "11px" }}>
                  {(data.formats?.agentsMd ?? data.agentsMd).split("\n").length} lines
                </span>
              </div>
              <pre style={{
                margin: 0,
                padding: "20px",
                background: "#060f1f",
                fontSize: "12px",
                fontFamily: "'IBM Plex Mono', 'SF Mono', Consolas, monospace",
                color: "#c9d1d9",
                lineHeight: 1.6,
                maxHeight: "520px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                <code>{data.formats?.agentsMd ?? data.agentsMd}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Preview */}
        {!showCompare && (
        <div style={{
          background: "#060f1f",
          border: "1px solid var(--rule)",
          borderTop: "none",
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "#0a1628",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840" }} />
              <span style={{
                marginLeft: "12px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                {currentFormat.filename}
              </span>
            </div>
            <span style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              RepoContext
            </span>
          </div>
          <pre style={{
            margin: 0,
            padding: "28px 32px",
            fontSize: "13px",
            fontFamily: "'IBM Plex Mono', 'SF Mono', Consolas, monospace",
            color: "#c9d1d9",
            lineHeight: 1.65,
            overflowX: "auto",
            maxHeight: "600px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            <code>{currentContent}</code>
          </pre>
        </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        background: "white",
        borderTop: "1px solid var(--rule)",
        padding: "24px 48px",
        fontSize: "13px",
        color: "var(--muted)",
        textAlign: "center",
      }}>
        Generated by RepoContext — Enterprise-grade repository analysis for AI development.
      </footer>
    </main>
  )
}