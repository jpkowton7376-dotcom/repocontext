import type { Metadata } from "next"
import { LegalDocument } from "@/components/LegalDocument"
import { legalMetadata } from "@/lib/legal-meta"

// The body is client-rendered so the language switcher applies instantly;
// metadata is resolved from the locale cookie instead of being hard-coded.
//
// force-dynamic is required for that cookie read to survive: a statically
// generated (or CDN-cached) response would serve one language's title to
// everybody. These pages get little traffic, so the cost is negligible.
export const dynamic = "force-dynamic"

export function generateMetadata(): Metadata {
  return legalMetadata("terms")
}

export default function TermsPage() {
  return <LegalDocument section="terms" />
}
