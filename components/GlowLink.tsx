"use client"

import { useState } from "react"
import Link from "next/link"

export function GlowLink({
  href,
  children,
  style = {},
  target,
  rel,
}: {
  href: string
  children: React.ReactNode
  style?: React.CSSProperties
  target?: string
  rel?: string
}) {
  const [hovered, setHovered] = useState(false)
  const glowStyle: React.CSSProperties = {
    ...style,
    transition: "text-shadow 0.2s ease, color 0.2s ease",
    color: hovered ? "#3b82f6" : style.color,
    textShadow: hovered ? "0 0 12px rgba(59, 130, 246, 0.85)" : "none",
  }

  // Anchors, mailto links and external URLs must bypass next/link, otherwise
  // it treats them as routes and tries to prefetch them.
  const isExternal =
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("http://") ||
    href.startsWith("https://")

  if (isExternal) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={glowStyle}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={glowStyle}
    >
      {children}
    </Link>
  )
}
