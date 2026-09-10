import type { Metadata } from "next"

const TITLE = "Supported AI tools — RepoContext"
const DESCRIPTION =
  "Every AI coding tool RepoContext supports, from AGENTS.md and CLAUDE.md to Cursor rules and GitHub Copilot instructions."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
}

export default function AiToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
