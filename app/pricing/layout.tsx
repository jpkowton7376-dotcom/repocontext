import type { Metadata } from "next"

const TITLE = "Pricing — RepoContext"
const DESCRIPTION =
  "RepoContext pricing: Pro at $19/month, Pro Year at $149/year, or a one-time $299 buyout. Turn any GitHub repository into AI-ready context in seconds."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
