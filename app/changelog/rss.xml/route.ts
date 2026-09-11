import { changelog } from "@/lib/changelog-data"

export const runtime = "nodejs"
export const dynamic = "force-static"

/**
 * RSS 2.0 feed of the changelog. Users can paste
 * https://repocontext.com/changelog/rss.xml into any reader to be
 * notified when a new release ships.
 *
 * Output is hand-rolled XML (no library) so it has no extra
 * dependencies. Special characters are escaped with the minimal set
 * needed for valid RSS 2.0.
 */
export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://repocontext.vercel.app"
  const feedUrl = `${siteUrl}/changelog/rss.xml`
  const pageUrl = `${siteUrl}/changelog`
  const now = new Date().toUTCString()

  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")

  const items = changelog
    .map((entry) => {
      const url = `${siteUrl}/changelog#${entry.slug}`
      const pubDate = new Date(entry.date).toUTCString()
      const description = [
        `<p>${escape(entry.summary)}</p>`,
        "<ul>",
        ...entry.items.map((it) => `<li>${escape(it.text)}</li>`),
        "</ul>",
      ].join("")
      return `    <item>
      <title>${escape(entry.title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escape(entry.tag)}</category>
      <description>${description}</description>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RepoContext Changelog</title>
    <link>${escape(pageUrl)}</link>
    <atom:link href="${escape(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>Every release, improvement, and fix in RepoContext.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
