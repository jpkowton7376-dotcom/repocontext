import type { Metadata } from "next"

const TITLE = "Public API for CI bots and IDE plugins · RepoContext"
const DESCRIPTION =
  "A single HTTP endpoint that turns any GitHub repository into a high-quality AGENTS.md / CLAUDE.md / Cursor rules / Copilot instructions pack. Same pipeline as the web app."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/api/og?title=Public%20API&subtitle=An%20HTTP%20endpoint%20for%20CI%20bots%20and%20IDE%20plugins",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/api/og?title=Public%20API&subtitle=An%20HTTP%20endpoint%20for%20CI%20bots%20and%20IDE%20plugins"],
  },
}

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}