"use client"

import Link from "next/link"
import { Star } from "lucide-react"
import {
  type HardwareProject,
  partsCount,
  formatRelativeTime,
} from "@/lib/forge-data"

export function ForgeProjectCard({
  project,
  starred,
  onStar,
}: {
  project: HardwareProject
  starred: boolean
  onStar: () => void
}) {
  const count = partsCount(project)
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e7eaf0",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform .15s ease, box-shadow .15s ease",
        boxShadow: "0 1px 2px rgba(15,23,42,.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)"
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(15,23,42,.12)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none"
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,23,42,.04)"
      }}
    >
      <Link
        href={`/forge/${project.slug}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "4 / 3",
            background: "#0b1120",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover}
            alt={project.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <button
            type="button"
            aria-label={starred ? "Unstar project" : "Star project"}
            onClick={(e) => {
              e.preventDefault()
              onStar()
            }}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "none",
              background: starred ? "#facc15" : "rgba(15,23,42,.55)",
              color: starred ? "#1f2937" : "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            <Star size={18} fill={starred ? "#1f2937" : "none"} />
          </button>
        </div>
      </Link>

      <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <Link
          href={`/forge/${project.slug}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.25 }}>
            {project.title}
          </h3>
        </Link>

        <div style={{ display: "flex", gap: 14, color: "#64748b", fontSize: 13, fontWeight: 500 }}>
          <span>{count} parts</span>
          <span>{project.stars + (starred ? 1 : 0)} stars</span>
          <span>{formatRelativeTime(project.createdAt)}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: project.avatarColor,
                color: "white",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {project.author.slice(0, 1)}
            </span>
            <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{project.author}</span>
          </div>
          {project.tags[0] && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: "#2563eb",
                background: "#eff6ff",
                padding: "4px 8px",
                borderRadius: 999,
              }}
            >
              {project.tags[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
