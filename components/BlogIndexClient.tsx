"use client"

import Link from "next/link"
import { useState } from "react"
import type { BlogPost } from "@/lib/blog-data"

type Lang = "en" | "zh"

const toggleStyle = (active: boolean): React.CSSProperties => ({
  padding: "6px 14px",
  borderRadius: "999px",
  border: "1px solid var(--rule)",
  background: active ? "var(--blue-60)" : "transparent",
  color: active ? "white" : "var(--muted)",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
})

export default function BlogIndexClient({ posts }: { posts: BlogPost[] }) {
  const [lang, setLang] = useState<Lang>("en")

  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 24px 120px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Blog</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setLang("en")} style={toggleStyle(lang === "en")}>EN</button>
          <button onClick={() => setLang("zh")} style={toggleStyle(lang === "zh")}>中文</button>
        </div>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "16px", margin: "8px 0 48px" }}>
        {lang === "en"
          ? "Guides for turning any repository into AI-ready context."
          : "把任何程式庫轉換成 AI 可用脈絡的實用指南。"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{
              display: "block",
              padding: "24px",
              border: "1px solid var(--rule)",
              borderRadius: "12px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "8px" }}>{post.date}</div>
            <h2 style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 8px" }}>
              {lang === "en" ? post.title : post.titleZh}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
              {lang === "en" ? post.excerpt : post.excerptZh}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}
