/**
 * The canonical public origin of this deployment, e.g. "https://repocontext.dev".
 *
 * Every absolute URL the product emits — OG tags, sitemap, robots, share
 * links, the API examples on /developers, and the credit line written into
 * every generated AGENTS.md — must come from here rather than a literal.
 *
 * A hard-coded domain silently points users at whatever that domain happens
 * to resolve to. That is not hypothetical: the code used to bake
 * "https://repocontext.com" into every generated file, and that domain is
 * registered to a third party.
 *
 * Configure NEXT_PUBLIC_SITE_URL in Vercel and in .env.local. The fallback
 * is the production domain, so an unconfigured deploy still emits correct
 * links once DNS is live.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://repocontext.dev"
).replace(/\/+$/, "")

/** SITE_URL without the scheme, for places that show the bare host. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "")
