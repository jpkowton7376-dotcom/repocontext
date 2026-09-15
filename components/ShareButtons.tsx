"use client"

import { useEffect, useState } from "react"

const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  fontWeight: 500,
  padding: "7px 14px",
  borderRadius: "6px",
  border: "1px solid var(--rule)",
  color: "var(--ink)",
  textDecoration: "none",
  background: "white",
}

export function ShareButtons({
  title = "Just turned my repo into AI-ready context with RepoContext",
}: {
  title?: string
}) {
  const [url, setUrl] = useState("")
  useEffect(() => setUrl(window.location.href), [])

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`
  const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(
    url,
  )}&title=${encodeURIComponent(title)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url,
  )}`

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      <span style={{ fontSize: "13px", color: "var(--muted)" }}>Share:</span>
      <a href={xUrl} target="_blank" rel="noopener noreferrer" style={btnStyle}>
        X
      </a>
      <a href={redditUrl} target="_blank" rel="noopener noreferrer" style={btnStyle}>
        Reddit
      </a>
      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={btnStyle}>
        LinkedIn
      </a>
    </div>
  )
}
