import type { Metadata } from "next"

const TITLE = "Changelog — RepoContext"
const DESCRIPTION =
  "Latest releases, new features and product updates for RepoContext."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
}

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
