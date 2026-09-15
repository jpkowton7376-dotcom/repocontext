import type { Metadata } from "next"
import { BLOG_POSTS } from "@/lib/blog-data"
import { SITE_URL } from "@/lib/site-url"
import BlogIndexClient from "@/components/BlogIndexClient"

export const metadata: Metadata = {
  title: "Blog — RepoContext",
  description:
    "Practical guides on AGENTS.md, CLAUDE.md, and Cursor rules — how to give AI coding agents reliable context from your repository.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: {
      en: `${SITE_URL}/blog`,
      "zh-Hant": `${SITE_URL}/blog`,
      "x-default": `${SITE_URL}/blog`,
    },
  },
}

export default function BlogIndex() {
  return <BlogIndexClient posts={BLOG_POSTS} />
}
