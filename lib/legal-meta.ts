import type { Metadata } from "next"
import { cookies } from "next/headers"
import { defaultLocale, locales, type Locale } from "@/app/i18n/config"
import en from "@/app/i18n/dictionaries/en.json"
import es from "@/app/i18n/dictionaries/es.json"
import zhHant from "@/app/i18n/dictionaries/zh-Hant.json"
import ja from "@/app/i18n/dictionaries/ja.json"

/**
 * Server-side metadata for the legal and how-to pages.
 *
 * The page body is rendered on the client (so the language switcher can
 * swap it without a reload), which means `export const metadata` would be
 * stuck in one language. Reading the NEXT_LOCALE cookie here lets search
 * engines and link previews see the title in the language the visitor
 * actually picked.
 */
const dictionaries = { en, es, "zh-Hant": zhHant, ja } as const

/** The locale the visitor chose, falling back to English. */
export function localeFromCookie(): Locale {
  const raw = cookies().get("NEXT_LOCALE")?.value ?? ""
  return (locales as readonly string[]).includes(raw) ? (raw as Locale) : defaultLocale
}

export type LegalSection = "terms" | "privacy" | "refund" | "aup" | "howto"

export function legalMetadata(section: LegalSection): Metadata {
  const d = (dictionaries[localeFromCookie()] as any)[section]
  const title: string = d.metaTitle
  const description: string = d.metaDescription
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary", title, description },
  }
}
