import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

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
    "/workshop",
    "/terms",
    "/privacy",
    "/refund",
    "/acceptable-use",
    "/login",
    "/signup",
  ]
  const now = new Date()
  return routes.map((r) => ({
    url: base + r,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: r === "" ? 1 : 0.7,
  }))
}
