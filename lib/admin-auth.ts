import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"

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
 * Verifies the caller is authenticated AND an admin.
 *
 * A user is an admin when EITHER:
 *   1. their email is in the ADMIN_EMAILS env allowlist (bootstrap / emergency
 *      override — lets you get back in even if every DB flag is off), OR
 *   2. their profiles.is_admin flag is true (the primary, runtime-toggleable
 *      source of truth — toggled from the /admin panel, no redeploy).
 *
 * Always returns a discriminated result — never throws — so callers can map
 * it straight to a JSON response.
 */
export async function requireAdmin(): Promise<AdminResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, status: 503, error: "Supabase not configured" }
  }

  const user = await getSessionUser()
  if (!user) {
    return { ok: false, status: 401, error: "Not authenticated" }
  }

  // 1) Env allowlist (bootstrap / override).
  if (adminEmailSet().has(user.email)) {
    return { ok: true, userId: user.id, email: user.email }
  }

  // 2) DB flag, read under the service role (RLS limits a user to their own
  //    profile row, so this must bypass RLS).
  const admin = createAdminClient()
  if (admin) {
    try {
      const { data } = await admin
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle()
      if (data?.is_admin) {
        return { ok: true, userId: user.id, email: user.email }
      }
    } catch {
      // fall through to 403
    }
  }

  return { ok: false, status: 403, error: "Not an admin" }
}
