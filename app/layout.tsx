import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/components/LanguageProvider"
import { CustomerServiceWidget } from "@/components/CustomerServiceWidget"

export const metadata: Metadata = {
  title: "RepoContext — Turn your codebase into AI-ready context",
  description:
    "Enterprise-grade repository analysis. Generate accurate AGENTS.md, CLAUDE.md, and Cursor rules for AI coding agents in seconds.",
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
