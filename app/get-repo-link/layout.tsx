import type { Metadata } from "next"

const TITLE = "How to get your repo link — RepoContext"
const DESCRIPTION =
  "Step-by-step guide to finding and copying your GitHub repository link so RepoContext can analyze it."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
}

export default function GetRepoLinkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
