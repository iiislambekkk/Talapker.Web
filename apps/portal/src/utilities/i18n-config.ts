export const LOCALES = ['kk', 'ru', 'en'] as const
export type Language = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Language = 'kk'
