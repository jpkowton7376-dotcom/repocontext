"use client"

import Link from "next/link"
import { useTranslation } from "./LanguageProvider"
import { LanguageSwitcher } from "./LanguageSwitcher"

export const SUPPORT_EMAIL = "jpkowton@gmail.com"

type LegalKey = "terms" | "privacy" | "refund" | "aup"

/** A translated clause. `body` and `bullets` are both optional. */
type Section = { heading: string; body?: string[]; bullets?: string[] }

/** Cross-links so readers can move between the four documents. */
const RELATED: Record<LegalKey, { href: string; key: string }[]> = {
  terms: [
    { href: "/privacy", key: "legal.linkPrivacy" },
    { href: "/refund", key: "legal.linkRefund" },
    { href: "/acceptable-use", key: "legal.linkAup" },
  ],
  privacy: [
    { href: "/terms", key: "legal.linkTerms" },
    { href: "/refund", key: "legal.linkRefund" },
    { href: "/acceptable-use", key: "legal.linkAup" },
  ],
  refund: [
    { href: "/terms", key: "legal.linkTerms" },
    { href: "/privacy", key: "legal.linkPrivacy" },
    { href: "/acceptable-use", key: "legal.linkAup" },
  ],
  aup: [
    { href: "/terms", key: "legal.linkTerms" },
    { href: "/privacy", key: "legal.linkPrivacy" },
    { href: "/refund", key: "legal.linkRefund" },
  ],
}

/**
 * Renders one of the legal documents from the dictionary.
 *
 * All four share the same shape, so they share one component: a heading,
 * an "last updated" line, a list of sections, then the language note,
 * disclaimer, contact block and cross-links.
 */
export function LegalDocument({ section }: { section: LegalKey }) {
  const { t, dict } = useTranslation()
  const doc = dict[section]
  const sections = doc.sections as unknown as Section[]

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-rule/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center font-mono font-bold text-accent2 text-sm">
            {"{}"}
          </div>
          <span className="font-bold text-lg">RepoContext</span>
        </Link>
        {/* Without a switcher here a reader who lands on a clause in the
            wrong language has no way to change it. */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher variant="dark" />
          <Link
            href="/"
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            {t("legal.backHome")}
          </Link>
        </div>
      </nav>

      <article className="flex-1 px-6 py-12 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
        <p className="text-muted mb-8">
          {t("legal.updatedLabel")} {t("legal.updatedDate")}
        </p>

        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold mt-8 mb-3">{s.heading}</h2>
            <div className="space-y-4 leading-7">
              {s.body?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.bullets && (
                <ul className="list-disc pl-6 space-y-2">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}

        {/* Translations are a courtesy — say which version wins. */}
        <section className="mt-12 p-4 bg-white/5 border border-rule rounded-lg">
          <h2 className="text-base font-bold mb-2">{t("legal.languageTitle")}</h2>
          <p className="text-sm text-muted leading-6">{t("legal.languageBody")}</p>
        </section>

        <section className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>⚠️ {t("legal.disclaimerTitle")}:</strong>{" "}
            {t("legal.disclaimerBody")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold mb-3">{t("legal.contactTitle")}</h2>
          <p>
            {t("legal.contactPrefix")}{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-accent2 hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className="mt-8 pt-6 border-t border-rule/50">
          <h2 className="text-sm font-bold mb-3 text-muted">
            {t("legal.relatedTitle")}
          </h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {RELATED[section].map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="text-accent2 hover:underline text-sm"
                >
                  {t(r.key)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  )
}
