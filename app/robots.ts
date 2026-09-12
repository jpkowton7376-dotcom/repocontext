import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

const base = SITE_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/"],
    },
    sitemap: base + "/sitemap.xml",
    host: base,
  }
}
