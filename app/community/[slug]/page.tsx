import type { Metadata } from "next"
import { ProjectDetail } from "./ProjectDetail"
import { SEED_PROJECTS } from "@/lib/community-data"

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const project = SEED_PROJECTS.find((p) => p.slug === params.slug)
  const title = project ? `${project.title} — RepoContext Community` : "RepoContext Community"
  const description = project ? project.summary : "Shareable repo context setups from the RepoContext community."
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default function CommunityProjectPage({
  params,
}: {
  params: { slug: string }
}) {
  return <ProjectDetail slug={params.slug} />
}
