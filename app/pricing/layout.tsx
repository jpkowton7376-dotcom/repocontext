import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing — RepoContext",
  description:
    "RepoContext pricing: Pro at $19/month, Pro Year at $149/year, or a one-time $299 buyout. Turn any GitHub repository into AI-ready context in seconds.",
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
