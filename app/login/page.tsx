"use client"

import { useState } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Supabase 未配置时显示提示
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen flex flex-col">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-rule/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center font-mono font-bold text-accent2 text-sm">
              {"{}"}
            </div>
            <span className="font-bold text-lg">RepoContext</span>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="text-5xl mb-4">🔧</div>
            <h1 className="text-2xl font-bold mb-3">Authentication not set up</h1>
            <p className="text-muted mb-6">
              The user login system requires Supabase to be configured.
              Don&apos;t worry — you can still use RepoContext without logging in!
            </p>
            <div className="p-4 bg-bg2 border border-rule rounded-xl text-left mb-6">
              <p className="text-sm text-muted mb-2">
                <strong className="text-ink">To enable login, add these to your .env.local:</strong>
              </p>
              <pre className="text-xs font-mono text-accent2 bg-bg3 p-3 rounded-lg overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...`}
              </pre>
              <p className="text-xs text-muted mt-3">
                Sign up at{" "}
                <a href="https://supabase.com" target="_blank" rel="noopener" className="text-accent2 hover:underline">
                  supabase.com
                </a>{" "}
                (free tier works great).
              </p>
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-rule/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center font-mono font-bold text-accent2 text-sm">
            {"{}"}
          </div>
          <span className="font-bold text-lg">RepoContext</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
          <p className="text-muted text-center mb-8">
            Sign in to your RepoContext account
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-bg2 border border-rule rounded-lg text-ink placeholder-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-bg2 border border-rule rounded-lg text-ink placeholder-muted focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent/90 disabled:bg-accent/40 text-white font-semibold rounded-lg transition-all"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-accent2 hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-8 p-4 bg-bg2 border border-rule rounded-lg">
            <p className="text-sm text-muted">
              💡 <strong>Tip:</strong> If you haven&apos;t set up Supabase yet,
              you can still use RepoContext without logging in — just head back
              to the homepage.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
