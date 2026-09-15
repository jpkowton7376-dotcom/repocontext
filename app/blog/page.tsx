import Link from "next/link"
import type { Metadata } from "next"
import { BLOG_POSTS } from "@/lib/blog-data"
import { SITE_URL } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Blog — RepoContext",
  description:
    "Practical guides on AGENTS.md, CLAUDE.md, and Cursor rules — how to give AI coding agents reliable context from your repository.",
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default function BlogIndex() {
  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 24px 120px" }}>
      <h1 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "8px" }}>
        Blog
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "16px", marginBottom: "48px" }}>
        Guides for turning any repository into AI-ready context.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {BLOG_POSTS.map((post) => (
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
            <h2 style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 8px" }}>{post.title}</h2>
            <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
