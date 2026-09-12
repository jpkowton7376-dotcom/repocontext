import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase"
import { SITE_URL } from "@/lib/site-url"

const FALLBACK_TITLE = "Shared analysis — RepoContext"
const FALLBACK_DESCRIPTION =
  "A shared RepoContext analysis: AI-ready context for this repository."

/**
 * Shared results are public, so each link gets its own title and social
 * preview built from the repository that was analysed.
 *
 * The page itself is a client component, so the metadata lives here in a
 * server component (a client component cannot export metadata).
 */
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  let repo: string | undefined

  try {
    const admin = createAdminClient()
    if (admin) {
      const { data } = await admin
        .from("shared_analyses")
        .select("repo_full_name")
        .eq("id", params.id)
        .maybeSingle()
      repo = data?.repo_full_name as string | undefined
    }
  } catch {
    // Missing table or transient error — fall back to the generic tags
    // rather than failing the whole page render.
  }

  if (!repo) {
    return {
      title: FALLBACK_TITLE,
      description: FALLBACK_DESCRIPTION,
      openGraph: {
        title: FALLBACK_TITLE,
        description: FALLBACK_DESCRIPTION,
        type: "article",
        url: `${SITE_URL}/result/${params.id}`,
      },
      twitter: {
        card: "summary",
        title: FALLBACK_TITLE,
        description: FALLBACK_DESCRIPTION,
      },
    }
  }

  const title = `${repo} — RepoContext analysis`
  const description = `AI-ready context for ${repo}: generated AGENTS.md, CLAUDE.md and Cursor rules, plus a repository quality breakdown.`
  const url = `${SITE_URL}/result/${params.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default function SharedResultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
