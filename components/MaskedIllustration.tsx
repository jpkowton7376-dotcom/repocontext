"use client"

import { useState } from "react"
import Image from "next/image"

/**
 * A reusable illustration wrapper that matches the site-wide icon language:
 * square AI-generated renders on a blue rounded tile, with the bottom-right
 * watermark masked out and a subtle hover scale/rotate interaction.
 */
interface MaskedIllustrationProps {
  src: string
  alt: string
  size?: number
  hover?: boolean
}

export function MaskedIllustration({
  src,
  alt,
  size = 80,
  hover = true,
}: MaskedIllustrationProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
        WebkitMaskImage:
          "linear-gradient(135deg, #000 0 88%, transparent 88% 100%), linear-gradient(#000, #000)",
        maskImage:
          "linear-gradient(135deg, #000 0 88%, transparent 88% 100%), linear-gradient(#000, #000)",
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
        transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform:
          hover && hovered ? "scale(1.08) rotate(5deg)" : "scale(1) rotate(0deg)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        style={{ objectFit: "cover" }}
      />
    </div>
  )
}
