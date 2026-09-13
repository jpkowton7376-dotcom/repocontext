import type { Metadata } from "next"
import { NewProjectForm } from "./NewProjectForm"

export const metadata: Metadata = {
  title: "Share a project — RepoContext Community",
  description: "Share your AGENTS.md, Cursor Rules, or repo context setup with the RepoContext community.",
}

export default function NewCommunityProjectPage() {
  return <NewProjectForm />
}
