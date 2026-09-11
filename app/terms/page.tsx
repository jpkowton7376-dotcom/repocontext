import type { Metadata } from "next"
import { LegalDocument } from "@/components/LegalDocument"
import { legalMetadata } from "@/lib/legal-meta"

// The body is client-rendered so the language switcher applies instantly;
// metadata is resolved from the locale cookie instead of being hard-coded.
//
// Reading the locale cookie already makes the route dynamic; force-dynamic
// states that explicitly so nobody "optimises" it back into a prerendered
// page and silently pins one language for everybody.
export const dynamic = "force-dynamic"

export function generateMetadata(): Metadata {
  return legalMetadata("terms")
}

export default function TermsPage() {
  return <LegalDocument section="terms" />
}
