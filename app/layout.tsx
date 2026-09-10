import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/components/LanguageProvider"
import { CustomerServiceWidget } from "@/components/CustomerServiceWidget"

const SITE_NAME = "RepoContext"
const DEFAULT_TITLE = "RepoContext — Turn your codebase into AI-ready context"
const DEFAULT_DESCRIPTION =
  "Enterprise-grade repository analysis. Generate accurate AGENTS.md, CLAUDE.md, and Cursor rules for AI coding agents in seconds."

export const metadata: Metadata = {
  // Required so relative openGraph images / urls resolve to absolute ones.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://repocontext.vercel.app",
  ),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Serif:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          {children}
          <CustomerServiceWidget />
        </LanguageProvider>
      </body>
    </html>
  )
}
