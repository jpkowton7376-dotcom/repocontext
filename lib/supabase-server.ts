// Server-only Supabase helpers. Kept in a separate file so client components
// never pull in `next/headers`.
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const cookieStore = cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Ignore: cookie mutation is not allowed in every server context.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch {
          // Ignore
        }
      },
    },
  })
}

// Returns the signed-in Supabase user, or null when anonymous.
export async function getCurrentUser() {
  const client = createServerSupabaseClient()
  if (!client) return null
  const {
    data: { user },
  } = await client.auth.getUser()
  return user ?? null
}
