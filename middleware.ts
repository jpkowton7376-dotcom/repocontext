import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Canonical host redirect: the legacy *.vercel.app domain should resolve to the
  // production custom domain so there is a single canonical URL for SEO/social.
  const host = request.headers.get("host")?.toLowerCase() ?? ""
  if (host === "repocontext.vercel.app") {
    const url = request.nextUrl.clone()
    url.protocol = "https"
    url.host = "www.repocontext.dev"
    return NextResponse.redirect(url, 308)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return response
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        request.cookies.set({ name, value: "", ...options })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({ name, value: "", ...options })
      },
    },
  })

  // Refresh the session cookie on every request. Without this, the short-lived
  // access token can expire between page loads and the client will be logged out.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/creem/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
