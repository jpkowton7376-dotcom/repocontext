import Link from "next/link"

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
        padding: "48px",
      }}
    >
      <div
        style={{
          fontSize: "80px",
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
          fontSize: "24px",
          fontWeight: 600,
          color: "var(--ink)",
          margin: "0 0 12px 0",
        }}
      >
        Page not found
      </h1>
      <p style={{ fontSize: "15px", color: "var(--muted)", marginBottom: "32px", maxWidth: "420px" }}>
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
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
