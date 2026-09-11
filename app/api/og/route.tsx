import { ImageResponse } from "next/og"

export const runtime = "edge"
export const dynamic = "force-dynamic"

/**
 * Generates the 1200x630 Open Graph / Twitter card image.
 *
 *   <meta property="og:image" content="/api/og">
 *   <meta name="twitter:image" content="/api/og">
 *
 * Accepts optional query params so individual pages can ship a tailored
 * card without authoring a separate image asset:
 *   ?title=Pricing&subtitle=Plans%20for%20every%20team
 */
const SITE_NAME = "RepoContext"
const DEFAULT_TAGLINE = "AI-ready context for any GitHub repository"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const title = (url.searchParams.get("title") || SITE_NAME).slice(0, 80)
  const subtitle = (
    url.searchParams.get("subtitle") || DEFAULT_TAGLINE
  ).slice(0, 140)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #1d4ed8 0%, #0e1a4a 60%, #0b1024 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            {"{}"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {SITE_NAME}
            </span>
            <span style={{ fontSize: "16px", opacity: 0.7, marginTop: "2px" }}>
              AGENTS.md · CLAUDE.md · Cursor · Copilot
            </span>
          </div>
        </div>

        {/* Middle: title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "900px",
          }}
        >
          <span
            style={{
              fontSize: "76px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: "30px",
              fontWeight: 400,
              opacity: 0.85,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {subtitle}
          </span>
        </div>

        {/* Bottom: CTA pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "20px",
            opacity: 0.75,
          }}
        >
          <span
            style={{
              padding: "10px 18px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "999px",
              fontWeight: 500,
            }}
          >
            repocontext.com
          </span>
          <span>From any repo → AI-ready context in 60 seconds</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}