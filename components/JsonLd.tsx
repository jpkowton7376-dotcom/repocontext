/**
 * Renders a JSON-LD structured-data script tag for SEO.
 * Used for Organization, WebSite, SoftwareApplication, Product, FAQPage etc.
 *
 * Safe to embed multiple times on the same page — search engines merge
 * all JSON-LD blocks. The component takes a single `data` object and
 * serialises it with the standard @context wrapper.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
