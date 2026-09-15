import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { BLOG_POSTS, getPost } from "@/lib/blog-data"
import { SITE_URL } from "@/lib/site-url"

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — RepoContext`,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "80px 24px 120px" }}>
      <Link href="/blog" style={{ color: "var(--muted)", fontSize: "14px", textDecoration: "none" }}>
        ← All posts
      </Link>
      <article style={{ marginTop: "24px" }}>
        <div style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "12px" }}>{post.date}</div>
        <h1 style={{ fontSize: "34px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 24px" }}>
          {post.title}
        </h1>
        <div
          className="blog-body"
          style={{ fontSize: "17px", lineHeight: 1.75, color: "var(--ink)" }}
          dangerouslySetInnerHTML={{ __html: post.body }}
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
          Generate your own context file →
        </Link>
      </div>
    </main>
  )
}
