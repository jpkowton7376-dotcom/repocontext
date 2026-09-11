import type { MetadataRoute } from "next"

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://repocontext.vercel.app"

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
    "/terms",
    "/privacy",
    "/refund",
  ]
  const now = new Date()
  return routes.map((r) => ({
    url: base + r,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: r === "" ? 1 : 0.7,
  }))
}
