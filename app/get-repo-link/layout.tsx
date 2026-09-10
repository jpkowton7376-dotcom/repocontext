import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How to get your repo link — RepoContext",
  description:
    "Step-by-step guide to finding and copying your GitHub repository link so RepoContext can analyze it.",
}

export default function GetRepoLinkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
