import type { Metadata } from "next"

const TITLE = "Documentation — RepoContext"
const DESCRIPTION =
  "Learn how to use RepoContext to turn any GitHub repository into accurate, AI-ready context."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
