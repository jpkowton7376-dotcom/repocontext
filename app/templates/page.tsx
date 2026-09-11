"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Globe,
  FileCode2,
  Cpu,
  Zap,
  Smartphone,
  Layers,
  Search,
  FileText,
  Link2,
  Gauge,
  Languages,
  LayoutGrid,
  Shield,
  GitBranch,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Boxes,
  Coffee,
  Code2,
  Server,
  Database,
  BookOpen,
  Braces,
  Terminal,
  type LucideIcon,
} from "lucide-react"
import { SiteNav } from "@/components/SiteNav"
import { JsonLd } from "@/components/JsonLd"
import { useTranslation } from "@/components/LanguageProvider"
import { SAMPLES, PROMPTS, BEST_PRACTICES, UI } from "@/lib/templates"
import type { Locale } from "@/app/i18n/config"

type Tab = "samples" | "prompts" | "best"

const GRADIENTS = {
  blue: "linear-gradient(135deg, #0f62fe 0%, #4589ff 100%)",
  teal: "linear-gradient(135deg, #009d9a 0%, #33b1b1 100%)",
  rust: "linear-gradient(135deg, #cc6600 0%, #fa4d56 100%)",
  cyan: "linear-gradient(135deg, #08bdba 0%, #3ddbd9 100%)",
  violet: "linear-gradient(135deg, #8a3ffc 0%, #a56eff 100%)",
  sky: "linear-gradient(135deg, #1192e8 0%, #82cfff 100%)",
  indigo: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
  emerald: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
  amber: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
  slate: "linear-gradient(135deg, #475569 0%, #94a3b8 100%)",
  php: "linear-gradient(135deg, #777bb4 0%, #a8acd8 100%)",
  java: "linear-gradient(135deg, #ee4c2c 0%, #ff7b58 100%)",
  node: "linear-gradient(135deg, #339933 0%, #5cb85c 100%)",
  ts: "linear-gradient(135deg, #3178c6 0%, #6aa6e2 100%)",
}

const SAMPLE_META: Record<string, { icon: LucideIcon; gradient: string }> = {
  nextjs: { icon: Globe, gradient: GRADIENTS.blue },
  python: { icon: FileCode2, gradient: GRADIENTS.teal },
  rust: { icon: Cpu, gradient: GRADIENTS.rust },
  go: { icon: Zap, gradient: GRADIENTS.cyan },
  reactnative: { icon: Smartphone, gradient: GRADIENTS.violet },
  monorepo: { icon: Layers, gradient: GRADIENTS.sky },
  java: { icon: Coffee, gradient: GRADIENTS.java },
  htmlcssjs: { icon: Code2, gradient: GRADIENTS.amber },
  nodejs: { icon: Server, gradient: GRADIENTS.node },
  phpweb: { icon: Database, gradient: GRADIENTS.php },
  markdown: { icon: BookOpen, gradient: GRADIENTS.slate },
  typescript: { icon: Braces, gradient: GRADIENTS.ts },
  phpcli: { icon: Terminal, gradient: GRADIENTS.indigo },
}

const PROMPT_META: Record<string, { icon: LucideIcon; gradient: string }> = {
  analyze: { icon: Search, gradient: GRADIENTS.indigo },
  generate: { icon: FileText, gradient: GRADIENTS.blue },
  evidence: { icon: Link2, gradient: GRADIENTS.emerald },
  score: { icon: Gauge, gradient: GRADIENTS.amber },
  translate: { icon: Languages, gradient: GRADIENTS.violet },
}

const BEST_META: Record<string, { icon: LucideIcon; gradient: string }> = {
  monorepo: { icon: Boxes, gradient: GRADIENTS.blue },
  private: { icon: Shield, gradient: GRADIENTS.emerald },
  multilingual: { icon: Globe, gradient: GRADIENTS.violet },
  cicd: { icon: GitBranch, gradient: GRADIENTS.rust },
  fresh: { icon: RefreshCw, gradient: GRADIENTS.teal },
}

const SAMPLE_IMG: Record<string, string> = {
  nextjs: "/templates/sample-nextjs.jpg",
  python: "/templates/sample-python.jpg",
  rust: "/templates/sample-rust.jpg",
  go: "/templates/sample-go.jpg",
  reactnative: "/templates/sample-reactnative.jpg",
  monorepo: "/templates/sample-monorepo.jpg",
  java: "/templates/sample-java.jpg",
  htmlcssjs: "/templates/sample-htmlcssjs.jpg",
  nodejs: "/templates/sample-nodejs.jpg",
  phpweb: "/templates/sample-phpweb.jpg",
  markdown: "/templates/sample-markdown.jpg",
  typescript: "/templates/sample-typescript.jpg",
  phpcli: "/templates/sample-phpcli.jpg",
}

const PROMPT_IMG: Record<string, string> = {
  analyze: "/templates/prompt-analyze.jpg",
  generate: "/templates/prompt-generate.jpg",
  evidence: "/templates/prompt-evidence.jpg",
  score: "/templates/prompt-score.jpg",
  translate: "/templates/prompt-translate.jpg",
}

const BEST_IMG: Record<string, string> = {
  monorepo: "/templates/best-monorepo.jpg",
  private: "/templates/best-private.jpg",
  multilingual: "/templates/best-multilingual.jpg",
  cicd: "/templates/best-cicd.jpg",
  fresh: "/templates/best-fresh.jpg",
}

function CardBanner({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      style={{
        height: "190px",
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "18px",
        background: "linear-gradient(135deg, #eaf1ff 0%, #f3f7ff 100%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  )
}

function IconBadge({ icon: Icon, gradient }: { icon: LucideIcon; gradient: string }) {
  return (
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
        flexShrink: 0,
      }}
    >
      <Icon size={24} color="white" strokeWidth={1.8} />
    </div>
  )
}

function CopyButton({ code, copyLabel, copiedLabel }: { code: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid var(--rule)",
        background: copied ? "var(--green-50)" : "white",
        color: copied ? "white" : "var(--ink-2)",
        cursor: "pointer",
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 500,
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? copiedLabel : copyLabel}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      style={{
        margin: 0,
        padding: "18px",
        background: "#161b22",
        color: "#e6edf3",
        borderRadius: "10px",
        overflowX: "auto",
        maxHeight: "360px",
        fontSize: "12.5px",
        lineHeight: 1.6,
        fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <code>{code}</code>
    </pre>
  )
}

function SectionBanner({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "200px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid var(--rule)",
        background: "linear-gradient(135deg, #eaf1ff 0%, #f6f9ff 100%)",
        marginBottom: "28px",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  )
}

function PromptCard({
  p,
  L,
}: {
  p: (typeof PROMPTS)[number]
  L: Locale
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = PROMPT_META[p.id]
  const preview = p.prompt.slice(0, 140).trim() + (p.prompt.length > 140 ? "…" : "")

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "24px",
        border: "1px solid var(--rule)",
        borderRadius: "14px",
        background: "white",
        transition: "box-shadow .15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 28px rgba(15,98,254,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <CardBanner src={PROMPT_IMG[p.id]} alt={p.badge} />
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <IconBadge icon={meta.icon} gradient={meta.gradient} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--blue-50)",
                background: "var(--accent-light)",
                padding: "3px 9px",
                borderRadius: "4px",
              }}
            >
              {p.badge}
            </span>
            <span style={{ fontSize: "13px", color: "var(--muted-2)" }}>
              {UI.useCase[L]}: {p.useCase[L]}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "15px", color: "var(--ink-2)", lineHeight: 1.6 }}>
            {p.note[L]}
          </p>
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
          border: "1px solid var(--rule-2)",
          borderRadius: "10px",
          padding: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: expanded ? "14px" : 0,
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--muted-2)", fontFamily: "'IBM Plex Mono', monospace" }}>
            Prompt
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <CopyButton code={p.prompt} copyLabel={UI.copy[L]} copiedLabel={UI.copied[L]} />
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--rule)",
                background: "white",
                color: "var(--ink-2)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? "Hide" : "Show full"}
            </button>
          </div>
        </div>

        {expanded ? (
          <CodeBlock code={p.prompt} />
        ) : (
          <p
            style={{
              margin: "12px 0 0",
              fontSize: "13.5px",
              color: "var(--ink)",
              fontFamily: "'IBM Plex Mono', monospace",
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            {preview}
          </p>
        )}
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const { t, locale } = useTranslation()
  const [tab, setTab] = useState<Tab>("samples")
  const L = locale as Locale

  const tabs: { id: Tab; label: string }[] = [
    { id: "samples", label: UI.tabSamples[L] },
    { id: "prompts", label: UI.tabPrompts[L] },
    { id: "best", label: UI.tabBest[L] },
  ]

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: UI.title[L],
          description: UI.subtitle[L],
          url: "https://repocontext.vercel.app/templates",
          isPartOf: { "@type": "WebSite", name: "RepoContext", url: "https://repocontext.vercel.app" },
        }}
      />

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
          {UI.eyebrow[L]}
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
          {UI.title[L]}
        </h1>
        <p
          style={{
            fontSize: "17px",
            color: "var(--ink-2)",
            lineHeight: 1.6,
            maxWidth: "720px",
            margin: "0 auto 28px",
          }}
        >
          {UI.subtitle[L]}
        </p>
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            height: "260px",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid var(--rule)",
            background: "linear-gradient(135deg, #eaf1ff 0%, #f3f7ff 100%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/templates/hero.png"
            alt={UI.title[L]}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </section>

      {/* Tabs */}
      <div
        style={{
          position: "sticky",
          top: "64px",
          zIndex: 50,
          background: "white",
          borderBottom: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          padding: "14px 16px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tb) => {
          const active = tab === tb.id
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              style={{
                padding: "9px 20px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                border: active ? "1px solid var(--blue-50)" : "1px solid var(--rule)",
                background: active ? "var(--blue-50)" : "white",
                color: active ? "white" : "var(--ink-2)",
                transition: "all .15s ease",
              }}
            >
              {tb.label}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <section
        style={{
          flex: 1,
          maxWidth: "1180px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 48px 96px",
          boxSizing: "border-box",
        }}
      >
        {/* ---------------- Sample library ---------------- */}
        <div style={{ display: tab === "samples" ? "block" : "none" }}>
          <SectionBanner src="/templates/samples.png" alt={UI.samplesTitle[L]} />
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {UI.samplesTitle[L]}
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              {UI.samplesSub[L]}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {SAMPLES.map((s) => {
              const meta = SAMPLE_META[s.id]
              return (
                <div
                  key={s.id}
                  style={{
                    padding: "16px",
                    border: "1px solid var(--rule)",
                    borderRadius: "14px",
                    background: "white",
                  }}
                >
                  <CardBanner src={SAMPLE_IMG[s.id]} alt={s.stack} />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 280px) minmax(0, 1fr)",
                      gap: "24px",
                      alignItems: "start",
                    }}
                    className="templates-sample-grid"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                      <IconBadge icon={meta.icon} gradient={meta.gradient} />
                      <div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: s.accent,
                            border: `1px solid ${s.accent}`,
                            padding: "3px 8px",
                            borderRadius: "4px",
                            display: "inline-block",
                            marginBottom: "6px",
                          }}
                        >
                          {s.format}
                        </span>
                        <h3 style={{ fontSize: "19px", fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
                          {s.stack}
                        </h3>
                      </div>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.6, margin: "0 0 14px" }}>
                      {s.desc[L]}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: "12px",
                            color: "var(--muted-2)",
                            background: "var(--bg-cool)",
                            border: "1px solid var(--rule-2)",
                            padding: "3px 9px",
                            borderRadius: "999px",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <CodeBlock code={s.code} />
                </div>
              )
            })}
          </div>
        </div>

        {/* ---------------- Prompt templates ---------------- */}
        <div style={{ display: tab === "prompts" ? "block" : "none" }}>
          <SectionBanner src="/templates/prompts.png" alt={UI.promptsTitle[L]} />
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {UI.promptsTitle[L]}
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              {UI.promptsSub[L]}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
              gap: "24px",
            }}
            className="templates-prompt-grid"
          >
            {PROMPTS.map((p) => (
              <PromptCard key={p.id} p={p} L={L} />
            ))}
          </div>
        </div>

        {/* ---------------- Best practices ---------------- */}
        <div style={{ display: tab === "best" ? "block" : "none" }}>
          <SectionBanner src="/templates/bestpractices.png" alt={UI.bestTitle[L]} />
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {UI.bestTitle[L]}
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              {UI.bestSub[L]}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}
            className="templates-best-grid"
          >
            {BEST_PRACTICES.map((b) => {
              const meta = BEST_META[b.id]
              return (
                <div
                  key={b.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    padding: "16px",
                    border: "1px solid var(--rule)",
                    borderRadius: "14px",
                    background: "white",
                  }}
                >
                  <CardBanner src={BEST_IMG[b.id]} alt={b.title[L]} />
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <IconBadge icon={meta.icon} gradient={meta.gradient} />
                    <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
                      {b.title[L]}
                    </h3>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                    {b.desc[L]}
                  </p>
                  <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-2)", marginTop: "4px" }}>
                    {UI.tips[L]}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {b.tips.map((tip, i) => (
                      <li key={i} style={{ display: "flex", gap: "10px", fontSize: "14px", lineHeight: 1.55, color: "var(--ink-2)" }}>
                        <span style={{ color: "var(--green-50)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{tip[L]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "var(--blue-90)",
          color: "white",
          padding: "56px 48px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: "30px", fontWeight: 300, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
          {UI.ctaTitle[L]}
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", maxWidth: "560px", margin: "0 auto 24px", lineHeight: 1.6 }}>
          {UI.ctaBody[L]}
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "white",
            color: "var(--blue-90)",
            padding: "12px 26px",
            fontSize: "15px",
            fontWeight: 600,
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          {UI.ctaButton[L]}
        </Link>
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
