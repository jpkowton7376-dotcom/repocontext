"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, Sparkles, Check, Loader2, Cpu, Cable, Wrench, Package, FileText, RotateCcw, ArrowRight } from "lucide-react"
import { useForge } from "@/lib/forge-store"
import { generateBlueprint, countBlueprint, type ChatStage } from "@/lib/forge-generate"
import type { HardwareProject } from "@/lib/forge-data"

type MsgRole = "user" | "assistant"

interface ChatMessage {
  id: number
  role: MsgRole
  text: string
}

const SUGGESTIONS = [
  "design a drone with gps and camera",
  "solar weather station with rain gauge",
  "line-following rover with obstacle avoidance",
  "rfid smart door lock with keypad",
  "6-axis robot arm with gripper",
  "wearable heart-rate band",
]

const STAGE_ICONS: Record<string, typeof Cpu> = {
  brief: Sparkles,
  parts: Package,
  wiring: Cable,
  mech: Cpu,
  build: FileText,
}

let msgSeq = 1

export function ForgeChat() {
  const router = useRouter()
  const { addProject } = useForge()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      text: "Describe the hardware you want to build. I'll engineer the full blueprint — parts list, wiring, mechanical package and step-by-step instructions.",
    },
  ])
  const [input, setInput] = useState("")
  const [working, setWorking] = useState(false)
  const [stages, setStages] = useState<(ChatStage & { status: "running" | "done" })[]>([])
  const [result, setResult] = useState<HardwareProject | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, stages, result])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const runGeneration = (prompt: string) => {
    setWorking(true)
    setResult(null)

    // The blueprint itself is produced synchronously by the deterministic
    // engine; stages are revealed progressively to mirror model streaming.
    const { project, stages: plan } = generateBlueprint(prompt)

    setStages(plan.map((s) => ({ ...s, status: "running" })))

    plan.forEach((stage, i) => {
      const t1 = setTimeout(() => {
        setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s)))
      }, 650 * (i + 1))
      timers.current.push(t1)
    })

    const done = setTimeout(() => {
      setStages([])
      setResult(project)
      setWorking(false)
      setMessages((prev) => [
        ...prev,
        {
          id: msgSeq++,
          role: "assistant",
          text: `Blueprint ready: **${project.title}** — review the summary below, then open it to explore parts, wiring, mechanics and build instructions.`,
        },
      ])
    }, 650 * (plan.length + 1))
    timers.current.push(done)
  }

  const send = (raw?: string) => {
    const prompt = (raw ?? input).trim()
    if (!prompt || working) return
    setInput("")
    setMessages((prev) => [...prev, { id: msgSeq++, role: "user", text: prompt }])
    runGeneration(prompt)
  }

  const publishAndOpen = () => {
    if (!result) return
    addProject(result)
    router.push(`/forge/${result.slug}`)
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setResult(null)
    setStages([])
    setWorking(false)
    setMessages([
      {
        id: 0,
        role: "assistant",
        text: "Describe the hardware you want to build. I'll engineer the full blueprint — parts list, wiring, mechanical package and step-by-step instructions.",
      },
    ])
  }

  const renderText = (text: string) =>
    text.split("**").map((chunk, i) =>
      i % 2 === 1 ? (
        <strong key={i} style={{ color: "#0f172a" }}>
          {chunk}
        </strong>
      ) : (
        <span key={i}>{chunk}</span>
      ),
    )

  const resultStats = result
    ? [
        { icon: Package, label: `${countBlueprint(result).count} parts` },
        { icon: Cable, label: `${result.wiringEdges?.length ?? 0} connections` },
        { icon: Wrench, label: `${result.build?.phases.length ?? 0} phases` },
        {
          icon: FileText,
          label: `${(result.build?.phases ?? []).reduce((s, ph) => s + ph.steps.length, 0)} steps`,
        },
      ]
    : []

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 24px 72px" }}>
      <Link
        href="/forge"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#2563eb", textDecoration: "none", fontWeight: 600, fontSize: 14 }}
      >
        <ArrowLeft size={16} /> Back to Forge
      </Link>

      <header style={{ textAlign: "center", margin: "26px 0 22px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#eff6ff",
            color: "#1d4ed8",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            padding: "6px 14px",
            borderRadius: 999,
          }}
        >
          <Sparkles size={13} /> AI Hardware Designer
        </div>
        <h1 style={{ margin: "14px 0 8px", fontSize: 38, fontWeight: 800, letterSpacing: "-.02em", color: "#0f172a" }}>
          Blueprint something real
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: "#64748b" }}>
          Chat with the AI to generate a complete, buildable hardware design.
        </p>
      </header>

      {/* Chat card */}
      <div
        style={{
          background: "white",
          border: "1px solid #e7eaf0",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.06)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          ref={scrollRef}
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minHeight: 320,
            maxHeight: 520,
            overflowY: "auto",
            background: "#fbfcfe",
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
            >
              <div
                style={{
                  maxWidth: "78%",
                  padding: "12px 16px",
                  borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role === "user" ? "#2563eb" : "white",
                  color: m.role === "user" ? "white" : "#334155",
                  border: m.role === "user" ? "1px solid #2563eb" : "1px solid #e7eaf0",
                  fontSize: 15,
                  lineHeight: 1.6,
                  fontWeight: m.role === "user" ? 500 : 400,
                }}
              >
                {renderText(m.text)}
              </div>
            </div>
          ))}

          {/* Streaming stages */}
          {(stages.length > 0 || working) && stages.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  background: "white",
                  border: "1px solid #e7eaf0",
                  borderRadius: "16px 16px 16px 4px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  minWidth: 320,
                }}
              >
                {stages.map((s) => {
                  const Icon = STAGE_ICONS[s.key] ?? Cpu
                  const isDone = s.status === "done"
                  return (
                    <div key={s.key} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          flexShrink: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isDone ? "#dcfce7" : "#eff6ff",
                          color: isDone ? "#15803d" : "#2563eb",
                          transition: "background .2s",
                        }}
                      >
                        {isDone ? <Check size={15} /> : <Loader2 size={15} className="animate-spin" />}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                          <Icon size={13} color="#94a3b8" />
                          {s.label}
                        </div>
                        {isDone && <div style={{ fontSize: 13, color: "#64748b", marginTop: 2, lineHeight: 1.5 }}>{s.detail}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Result card */}
          {result && (
            <div
              style={{
                margin: "4px auto 0",
                width: "100%",
                background: "white",
                border: "1px solid #dbe3ee",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 10px 34px rgba(37, 99, 235, 0.12)",
              }}
            >
              <div style={{ aspectRatio: "16 / 6", background: "#0b1120", position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.cover} alt={result.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: 18 }}>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0f172a" }}>{result.title}</h3>
                <p style={{ margin: "8px 0 14px", fontSize: 14, lineHeight: 1.6, color: "#475569" }}>{result.summary}</p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {resultStats.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#334155",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "6px 11px",
                        borderRadius: 999,
                      }}
                    >
                      <s.icon size={13} color="#2563eb" />
                      {s.label}
                    </span>
                  ))}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: "#ffffff",
                      background: "#0f172a",
                      padding: "6px 11px",
                      borderRadius: 999,
                    }}
                  >
                    ${countBlueprint(result).cost.toFixed(2)} est.
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "#2563eb", background: "#eff6ff", padding: "4px 9px", borderRadius: 999 }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={publishAndOpen}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "11px 20px",
                      borderRadius: 12,
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Open blueprint <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => send("Refine this design: make it cheaper and simpler")}
                    disabled={working}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "11px 18px",
                      borderRadius: 12,
                      border: "1px solid #dbe3ee",
                      background: "white",
                      color: "#0f172a",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: working ? "not-allowed" : "pointer",
                    }}
                  >
                    <Sparkles size={14} /> Refine
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "11px 18px",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      background: "white",
                      color: "#64748b",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={14} /> Start over
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && !working && (
          <div style={{ padding: "0 24px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "8px 14px",
                  borderRadius: 999,
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          style={{
            padding: 16,
            borderTop: "1px solid #eef2f7",
            display: "flex",
            gap: 10,
            background: "white",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask blueprint to design drones, rovers, sensors…"
            disabled={working}
            style={{
              flex: 1,
              padding: "13px 16px",
              borderRadius: 12,
              border: "1px solid #dbe3ee",
              fontSize: 15,
              outline: "none",
              background: working ? "#f8fafc" : "white",
            }}
          />
          <button
            type="submit"
            disabled={working || !input.trim()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              border: "none",
              background: working || !input.trim() ? "#cbd5e1" : "#0f172a",
              color: "white",
              cursor: working || !input.trim() ? "not-allowed" : "pointer",
            }}
            aria-label="Send"
          >
            {working ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}
