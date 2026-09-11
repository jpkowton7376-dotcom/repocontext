import Link from "next/link"
import type { Metadata } from "next"

const TITLE = "Page not found — RepoContext"

export const metadata: Metadata = {
  title: TITLE,
  robots: { index: false, follow: false },
}

const POPULAR = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Documentation" },
  { href: "/ai-tools", label: "Supported AI tools" },
  { href: "/how-to-use", label: "How to use" },
  { href: "/changelog", label: "Changelog" },
]

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-warm)",
        textAlign: "center",
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          fontSize: "96px",
          fontWeight: 300,
          fontFamily: "'IBM Plex Serif', Georgia, serif",
          color: "var(--blue-60)",
          lineHeight: 1,
          marginBottom: "16px",
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 600,
          color: "var(--ink)",
          margin: "0 0 12px 0",
          letterSpacing: "-0.01em",
        }}
      >
        We couldn&apos;t find that page
      </h1>
      <p
        style={{
          fontSize: "15px",
          color: "var(--muted)",
          marginBottom: "36px",
          maxWidth: "440px",
          lineHeight: 1.6,
        }}
      >
        The link may be broken, the page may have moved, or you might have
        typed the URL by hand. Here are some good starting points instead.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          maxWidth: "480px",
          width: "100%",
          marginBottom: "32px",
        }}
      >
        {POPULAR.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: "14px 16px",
              border: "1px solid var(--rule)",
              background: "white",
              color: "var(--ink)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
              transition: "background 0.15s ease, border-color 0.15s ease",
            }}
          >
            {link.label} →
          </Link>
        ))}
      </div>

      <Link
        href="/"
        style={{
          padding: "14px 28px",
          background: "var(--blue-60)",
          color: "white",
          fontWeight: 500,
          fontSize: "15px",
          textDecoration: "none",
          letterSpacing: "0.02em",
        }}
      >
        ← Back to home
      </Link>
    </main>
  )
}
