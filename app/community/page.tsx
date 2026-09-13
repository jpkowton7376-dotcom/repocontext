import type { Metadata } from "next"
import { CommunityFeed } from "./CommunityFeed"

export function generateMetadata(): Metadata {
  const title = "Community — RepoContext"
  const description =
    "Browse shareable repo context setups: AGENTS.md, Cursor Rules, CLAUDE.md, and Copilot Instructions from the community."
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default function CommunityPage() {
  return <CommunityFeed />
}
