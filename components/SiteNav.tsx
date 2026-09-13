"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useTranslation } from "./LanguageProvider"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { GlowLink } from "./GlowLink"

type Variant = "dark" | "light"

export function SiteNav({ variant = "light" }: { variant?: Variant }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const isDark = variant === "dark"

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return
    // 1. Initial state from local cookie (no network call — robust against
    //    transient token refresh failures that would otherwise null the user).
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    // 2. Only treat an explicit SIGNED_OUT event as a sign-out. Every other
    //    event (INITIAL_SESSION / TOKEN_REFRESHED / USER_UPDATED) just syncs
    //    the user object — it will NOT null the user on a missing session
    //    that could be a transient cookie read.
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user)
        } else if (_event === "SIGNED_OUT") {
          setUser(null)
        }
      }
    )
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const navStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 48px",
    height: "64px",
    borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--rule)",
    background: isDark ? "#111111" : "white",
    color: isDark ? "white" : "inherit",
    position: "sticky",
    top: 0,
    zIndex: 100,
  }

  const leftGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isDark ? "48px" : "32px",
  }

  const centerLinksStyle: React.CSSProperties = {
    display: "flex",
    gap: isDark ? "32px" : "32px",
    fontSize: "14px",
  }

  const rightLinksStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  }

  const linkColor = isDark ? "rgba(255,255,255,0.8)" : "var(--muted)"
  const textColor = isDark ? "white" : "var(--ink)"
  const buttonBg = "var(--blue-60)"
  const getStartedStyle: React.CSSProperties = {
    fontSize: "14px",
    padding: "10px 20px",
    background: buttonBg,
    color: "white",
    textDecoration: "none",
    fontWeight: 500,
    letterSpacing: "0.02em",
  }

  // On the dark variant the nav sits on the page itself, so anchors are
  // relative; everywhere else they need the leading slash.
  const navLinks = [
    { href: isDark ? "#features" : "/#features", key: "nav.features" },
    { href: isDark ? "#how" : "/#how", key: "nav.howItWorks" },
    { href: "/pricing", key: "nav.pricing" },
    { href: "/developers", key: "nav.api" },
    { href: "/docs", key: "nav.docs" },
    { href: "/ai-tools", key: "nav.aiTools" },
    { href: "/templates", key: "nav.templates" },
    { href: "/community", key: "nav.community" },
  ]

  const renderCenterLink = (href: string, key: string) => {
    if (isDark) {
      return (
        <GlowLink key={key} href={href} style={{ color: linkColor, textDecoration: "none" }}>
          {t(key)}
        </GlowLink>
      )
    }
    return (
      <Link key={key} href={href} style={{ color: linkColor, textDecoration: "none" }}>
        {t(key)}
      </Link>
    )
  }

  return (
    <nav className="rc-nav" style={navStyle}>
      <div style={leftGroupStyle}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}
        >
          <div style={{ width: "36px", height: "36px", position: "relative" }}>
            <Image
              src="/logo-dark.png"
              alt="RepoContext"
              fill
              sizes="36px"
              style={{ objectFit: "contain", backgroundColor: "transparent" }}
              priority
              quality={95}
            />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>
            RepoContext
          </span>
        </Link>
        {isDark && (
          <div className="rc-nav-links" style={centerLinksStyle}>
            {navLinks.map((l) => renderCenterLink(l.href, l.key))}
          </div>
        )}
      </div>
      {!isDark && (
        <div className="rc-nav-links" style={centerLinksStyle}>
          {navLinks.map((l) => renderCenterLink(l.href, l.key))}
        </div>
      )}
      <div style={rightLinksStyle}>
        {/* The switcher lists all four languages inline and is far too wide
            for a phone; it is rendered inside the menu instead. */}
        <div
          className="rc-nav-hide-sm"
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <LanguageSwitcher variant={isDark ? "dark" : "light"} />
        </div>
        {/* These also live in the hamburger panel, so hide them from the
            top bar on phones — otherwise they push the toggle off-screen. */}
        <div
          className="rc-nav-hide-sm"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
        {user ? (
          <>
            <Link
              href="/dashboard"
              style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: textColor }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: buttonBg,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {user.email?.charAt(0) || "U"}
              </div>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>{t("nav.dashboard")}</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                fontSize: "13px",
                color: textColor,
                background: "none",
                border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--rule)",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {t("nav.signOut")}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              style={{ fontSize: "14px", color: textColor, textDecoration: "none", fontWeight: 500 }}
            >
              {t("nav.signIn")}
            </Link>
            <Link href="/signup" style={getStartedStyle}>
              {t("nav.getStarted")}
            </Link>
          </>
        )}
        </div>

        {/* Hamburger — hidden on desktop, shown from 900px down via CSS. */}
        <button
          type="button"
          className="rc-nav-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            background: "none",
            border: isDark
              ? "1px solid rgba(255,255,255,0.2)"
              : "1px solid var(--rule)",
            color: isDark ? "white" : "var(--ink)",
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: 1,
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div
          className="rc-nav-mobile"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            padding: "20px",
            background: isDark ? "#111111" : "white",
            borderBottom: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid var(--rule)",
            zIndex: 200,
          }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: isDark ? "white" : "var(--ink)",
                textDecoration: "none",
                fontSize: "15px",
              }}
            >
              {t(l.key)}
            </Link>
          ))}

          <LanguageSwitcher variant={isDark ? "dark" : "light"} />

          <div
            style={{
              height: "1px",
              background: isDark ? "rgba(255,255,255,0.15)" : "var(--rule)",
            }}
          />

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                style={{
                  color: isDark ? "white" : "var(--ink)",
                  textDecoration: "none",
                  fontSize: "15px",
                }}
              >
                {t("nav.dashboard")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  handleSignOut()
                }}
                style={{
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: isDark ? "white" : "var(--ink)",
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                {t("nav.signOut")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  color: isDark ? "white" : "var(--ink)",
                  textDecoration: "none",
                  fontSize: "15px",
                }}
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                style={{ ...getStartedStyle, textAlign: "center" }}
              >
                {t("nav.getStarted")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
