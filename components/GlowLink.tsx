"use client"

import { useState } from "react"
import Link from "next/link"

export function GlowLink({
  href,
  children,
  style = {},
}: {
  href: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)
  const glowStyle: React.CSSProperties = {
    ...style,
    transition: "text-shadow 0.2s ease, color 0.2s ease",
    color: hovered ? "#3b82f6" : style.color,
    textShadow: hovered ? "0 0 12px rgba(59, 130, 246, 0.85)" : "none",
  }
  if (href.startsWith("#")) {
    return (
      <a
        href={href}
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
