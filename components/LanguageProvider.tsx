"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { defaultLocale, locales, type Locale } from "@/app/i18n/config"
import en from "@/app/i18n/dictionaries/en.json"
import es from "@/app/i18n/dictionaries/es.json"
import zhHant from "@/app/i18n/dictionaries/zh-Hant.json"
import ja from "@/app/i18n/dictionaries/ja.json"

type Dict = typeof en

const dictionaries: Record<Locale, Dict> = {
  en,
  es,
  "zh-Hant": zhHant,
  ja,
}

function getByPath(obj: any, path: string): string | any {
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj)
}

function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}

type TFunction = (key: string, vars?: Record<string, string | number>) => string

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFunction
  dict: Dict
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key) => key,
  dict: dictionaries[defaultLocale],
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const saved = localStorage.getItem("rc_locale")
    if (saved && (locales as readonly string[]).includes(saved)) {
      setLocaleState(saved as Locale)
      document.documentElement.lang = saved
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem("rc_locale", next)
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`
    document.documentElement.lang = next
  }, [])

  const dict = useMemo(() => dictionaries[locale] ?? dictionaries[defaultLocale], [locale])

  const t = useCallback<TFunction>(
    (key, vars) => {
      const value = getByPath(dict, key)
      if (typeof value !== "string") {
        // Allow arrays (e.g. feature lists) to be returned raw when caller wants them.
        return value ?? key
      }
      return vars ? interpolate(value, vars) : value
    },
    [dict],
  )

  // Provide a stable value so consumers don't re-render on every mount tick.
  const value = useMemo(
    () => ({ locale, setLocale, t, dict }),
    [locale, setLocale, t, dict],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useTranslation() {
  return useContext(LanguageContext)
}
