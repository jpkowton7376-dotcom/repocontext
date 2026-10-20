import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { isSupabaseConfigured } from "@/lib/supabase"

/**
 * Server-side admin guard for the internal /admin panel and its API routes.
 *
 * Authorization is an email allowlist from the ADMIN_EMAILS env var
 * (comma-separated). This keeps it dependency-free — no extra table, no
 * migration — and fails closed: if ADMIN_EMAILS is unset, nobody is an admin.
 *
 * Usage in a route handler:
 *   const auth = await requireAdmin()
 *   if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
 */

export type AdminResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: number; error: string }

/** Parses ADMIN_EMAILS into a lowercased set. Empty when unset. */
export function adminEmailSet(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || ""
  const set = new Set<string>()
  for (const part of raw.split(",")) {
    const e = part.trim().toLowerCase()
    if (e) set.add(e)
  }
  return set
}

/** Reads the signed-in user from the request cookies, if any. */
async function getSessionUser(): Promise<{ id: string; email: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const cookieStore = cookies()
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // Route handlers get a read-only cookie store; writes are ignored.
      set() {},
      remove() {},
    },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return { id: user.id, email: (user.email || "").toLowerCase() }
}

/**
 * Verifies the caller is authenticated AND on the ADMIN_EMAILS allowlist.
 * Always returns a discriminated result — never throws — so callers can map
 * it straight to a JSON response.
 */
export async function requireAdmin(): Promise<AdminResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, status: 503, error: "Supabase not configured" }
  }
  const admins = adminEmailSet()
  if (admins.size === 0) {
    return { ok: false, status: 403, error: "Admin panel is disabled (ADMIN_EMAILS not set)" }
  }

  const user = await getSessionUser()
  if (!user) {
    return { ok: false, status: 401, error: "Not authenticated" }
  }
  if (!admins.has(user.email)) {
    return { ok: false, status: 403, error: "Not an admin" }
  }
  return { ok: true, userId: user.id, email: user.email }
}
