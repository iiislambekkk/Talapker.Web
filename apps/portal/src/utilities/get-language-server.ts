import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, Language, LOCALES } from './i18n-config'

export async function getLanguageServer(): Promise<Language> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as Language

  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale
  }

  return DEFAULT_LOCALE
}
