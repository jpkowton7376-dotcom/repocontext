import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Changelog — RepoContext",
  description:
    "Latest releases, new features and product updates for RepoContext.",
}

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
