import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/components/LanguageProvider"
import { CustomerServiceWidget } from "@/components/CustomerServiceWidget"
import { CookieConsent } from "@/components/CookieConsent"
import { JsonLd } from "@/components/JsonLd"

const SITE_NAME = "RepoContext"
const DEFAULT_TITLE = "RepoContext — Turn your codebase into AI-ready context"
const DEFAULT_DESCRIPTION =
  "Enterprise-grade repository analysis. Generate accurate AGENTS.md, CLAUDE.md, and Cursor rules for AI coding agents in seconds."

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://repocontext.vercel.app"

export const metadata: Metadata = {
  // Required so relative openGraph images / urls resolve to absolute ones.
  metadataBase: new URL(SITE_URL),
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

// Global structured data — improves how Google and other crawlers
// understand the site and unlocks rich-result features (knowledge panel,
// sitelinks, organisation box). Each page can add its own via <JsonLd />.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: DEFAULT_DESCRIPTION,
  sameAs: [
    "https://github.com/jpkowton7376-dotcom/repocontext",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "jpkowton@gmail.com",
    contactType: "customer support",
    availableLanguage: ["en", "zh-Hant", "ja", "es"],
  },
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ["en", "zh-Hant", "ja", "es"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
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
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
      </head>
      <body>
        <LanguageProvider>
          {children}
          <CustomerServiceWidget />
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  )
}
