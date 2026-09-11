import type { Metadata } from "next"
import { HowToUseContent } from "./HowToUseContent"
import { legalMetadata } from "@/lib/legal-meta"

// See app/terms/page.tsx for why this must be dynamic.
export const dynamic = "force-dynamic"

export function generateMetadata(): Metadata {
  return legalMetadata("howto")
}

export default function HowToUsePage() {
  return <HowToUseContent />
}
