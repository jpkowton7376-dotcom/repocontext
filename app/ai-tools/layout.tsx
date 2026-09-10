import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Supported AI tools — RepoContext",
  description:
    "Every AI coding tool RepoContext supports, from AGENTS.md and CLAUDE.md to Cursor rules and GitHub Copilot instructions.",
}

export default function AiToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
