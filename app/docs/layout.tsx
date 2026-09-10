import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation — RepoContext",
  description:
    "Learn how to use RepoContext to turn any GitHub repository into accurate, AI-ready context.",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
