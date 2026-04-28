'use client'

import { usePathname } from 'next/navigation'
import { DEFAULT_LOCALE, Language, LOCALES } from '@/utilities/i18n-config'

export const useLanguage = (): Language => {
  const pathname = usePathname()

  if (!pathname) return DEFAULT_LOCALE

  const segments = pathname.split('/')
  const currentLocale = segments[1] as Language

  if (LOCALES.includes(currentLocale)) {
    return currentLocale
  }

  return DEFAULT_LOCALE
}
