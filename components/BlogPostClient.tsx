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

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const [lang, setLang] = useState<Lang>("en")

  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "80px 24px 120px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}>
        <Link href="/blog" style={{ color: "var(--muted)", fontSize: "14px", textDecoration: "none" }}>
          ← {lang === "en" ? "All posts" : "全部文章"}
        </Link>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setLang("en")} style={toggleStyle(lang === "en")}>EN</button>
          <button onClick={() => setLang("zh")} style={toggleStyle(lang === "zh")}>中文</button>
        </div>
      </div>

      <article>
        <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "12px" }}>{post.date}</div>
        <h1 style={{ fontSize: "34px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 24px" }}>
          {lang === "en" ? post.title : post.titleZh}
        </h1>
        <div
          className="blog-body"
          style={{ fontSize: "17px", lineHeight: 1.75, color: "var(--ink)" }}
          dangerouslySetInnerHTML={{ __html: lang === "en" ? post.body : post.bodyZh }}
        />
      </article>

      <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid var(--rule)" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "var(--blue-60)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          {lang === "en" ? "Generate your own context file →" : "產生你自己的脈絡檔 →"}
        </Link>
      </div>
    </main>
  )
}
