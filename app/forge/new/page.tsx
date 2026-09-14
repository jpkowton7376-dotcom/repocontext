"use client"

import { useState } from "react"
import { Sparkles, PenLine } from "lucide-react"
import { SiteNav } from "@/components/SiteNav"
import { NewProjectForm } from "./NewProjectForm"
import { ForgeChat } from "./ForgeChat"

type Mode = "ai" | "manual"

export default function NewProjectPage() {
  const [mode, setMode] = useState<Mode>("ai")

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <SiteNav variant="light" />

      {/* Mode switch */}
      <div style={{ maxWidth: 880, margin: "20px auto 0", padding: "0 24px", display: "flex", gap: 6 }}>
        {(
          [
            { key: "ai", label: "AI Designer", icon: Sparkles },
            { key: "manual", label: "Share manually", icon: PenLine },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: mode === m.key ? "#0f172a" : "#e2e8f0",
              background: mode === m.key ? "#0f172a" : "white",
              color: mode === m.key ? "white" : "#475569",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <m.icon size={14} />
            {m.label}
          </button>
        ))}
      </div>

      {mode === "ai" ? <ForgeChat /> : <NewProjectForm />}
    </main>
  )
}
