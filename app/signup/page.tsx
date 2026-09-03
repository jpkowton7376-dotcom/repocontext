"use client"

import { useState } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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
            <h1 className="text-2xl font-bold mb-3">Sign up not available yet</h1>
            <p className="text-muted mb-6">
              The user system requires Supabase to be configured.
              You can still use RepoContext without an account!
            </p>
            <div className="p-4 bg-bg2 border border-rule rounded-xl text-left mb-6">
              <p className="text-sm text-muted mb-2">
                <strong className="text-ink">To enable signup, add these to your .env.local:</strong>
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      const { error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Sign up failed")
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
          <h1 className="text-2xl font-bold text-center mb-2">Create account</h1>
          <p className="text-muted text-center mb-8">
            Start generating AGENTS.md for your repositories
          </p>

          {success ? (
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="font-bold text-lg mb-2">Check your email</h2>
              <p className="text-muted text-sm">
                We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                Click the link to activate your account.
              </p>
              <Link
                href="/"
                className="inline-block mt-4 text-accent2 hover:underline text-sm"
              >
                ← Back to home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
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
                  placeholder="At least 6 characters"
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
                {loading ? "Creating account..." : "Create account"}
              </button>

              <p className="text-xs text-muted text-center">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-accent2 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-accent2 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent2 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
