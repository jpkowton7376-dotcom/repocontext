"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, Files } from "lucide-react"
import { Project, FORMAT_COLORS, timeAgo, formatCount, initials } from "@/lib/community-data"

export function CommunityProjectCard({
  project,
  filesLabel,
  starsLabel,
  byLabel,
  onStar,
  isStarred,
}: {
  project: Project
  filesLabel: string
  starsLabel: string
  byLabel: string
  onStar?: () => void
  isStarred?: boolean
}) {
  return (
    <Link
      href={`/community/${project.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--rule)",
        borderRadius: "12px",
        background: "white",
        textDecoration: "none",
        color: "inherit",
        overflow: "hidden",
        transition: "box-shadow .15s ease, border-color .15s ease, transform .15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,98,254,0.08)"
        e.currentTarget.style.borderColor = "#c1c7cd"
        e.currentTarget.style.transform = "translateY(-2px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.borderColor = "var(--rule)"
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      {/* Cover */}
      <div style={{ position: "relative", aspectRatio: "16 / 10", background: "var(--bg-cool)", overflow: "hidden" }}>
        <Image
          src={project.cover}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onStar?.()
          }}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: "none",
            background: isStarred ? "#0f62fe" : "rgba(255,255,255,0.9)",
            color: isStarred ? "white" : "var(--ink-2)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          aria-label={isStarred ? "Unstar project" : "Star project"}
        >
          <Star size={16} fill={isStarred ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
            {project.formats.slice(0, 3).map((fmt) => (
              <span
                key={fmt}
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: FORMAT_COLORS[fmt],
                  background: `${FORMAT_COLORS[fmt]}14`,
                  padding: "3px 7px",
                  borderRadius: "4px",
                }}
              >
                {fmt}
              </span>
            ))}
          </div>
          <h3
            style={{
              fontFamily: "'IBM Plex Serif', Georgia, serif",
              fontSize: "18px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              margin: 0,
              lineHeight: 1.3,
              color: "var(--ink)",
            }}
          >
            {project.title}
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
          <span
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: project.author.avatarColor,
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {initials(project.author.name)}
          </span>
          <span style={{ fontSize: "13px", color: "var(--ink-2)" }}>{project.author.name}</span>
          <span style={{ fontSize: "12px", color: "var(--muted-2)", marginLeft: "auto" }}>{timeAgo(project.createdAt)}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px", color: "var(--muted)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Files size={14} /> {project.files.length} {filesLabel}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Star size={14} /> {formatCount(project.stars)} {starsLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}
