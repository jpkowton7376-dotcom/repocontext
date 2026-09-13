import type { Metadata } from "next"
import { WorkshopFeed } from "./WorkshopFeed"

export function generateMetadata(): Metadata {
  const title = "Workshop — RepoContext"
  const description =
    "Browse hardware projects shared by makers — parts lists, wiring, mechanics, and step-by-step build instructions."
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default function WorkshopPage() {
  return <WorkshopFeed />
}
