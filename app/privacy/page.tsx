import type { Metadata } from "next"
import { LegalDocument } from "@/components/LegalDocument"
import { legalMetadata } from "@/lib/legal-meta"

// See app/terms/page.tsx for why this must be dynamic.
export const dynamic = "force-dynamic"

export function generateMetadata(): Metadata {
  return legalMetadata("privacy")
}

export default function PrivacyPage() {
  return <LegalDocument section="privacy" />
}
