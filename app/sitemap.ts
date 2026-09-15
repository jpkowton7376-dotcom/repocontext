import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"
import { BLOG_POSTS } from "@/lib/blog-data"

const base = SITE_URL

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/pricing",
    "/docs",
    "/developers",
    "/how-to-use",
    "/get-repo-link",
    "/changelog",
    "/ai-tools",
    "/templates",
    "/forge",
    "/blog",
    "/terms",
    "/privacy",
    "/refund",
    "/acceptable-use",
    "/login",
    "/signup",
  ]
  const now = new Date()
  const staticRoutes = routes.map((r) => ({
    url: base + r,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: r === "" ? 1 : 0.7,
  }))
  const blogRoutes = BLOG_POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))
  return [...staticRoutes, ...blogRoutes]
}
