export const defaultLocale = 'en'
export const locales = ['en', 'es', 'zh-Hant', 'ja'] as const
export type Locale = (typeof locales)[number]

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  'zh-Hant': '繁體中文',
  ja: '日本語',
}
