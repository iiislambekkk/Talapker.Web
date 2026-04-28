import { NextRequest, NextResponse } from 'next/server'

const LOCALES = ['kk', 'ru', 'en']
const DEFAULT_LOCALE = 'kk'
const COOKIE_NAME = 'NEXT_LOCALE'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. ИСКЛЮЧЕНИЯ
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // 2. ОПРЕДЕЛЯЕМ ЛОКАЛЬ В ПУТИ
  const localeInPath = LOCALES.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // 3. ЕСЛИ ЛОКАЛЬ ЕСТЬ (Проверяем и сохраняем куку)
  if (localeInPath) {
    const cookieLocale = request.cookies.get(COOKIE_NAME)?.value

    // Создаем базовый ответ
    const response = NextResponse.next()

    // Если кука отличается от URL — ПЕРЕЗАПИСЫВАЕМ ЕЁ
    if (cookieLocale !== localeInPath) {
      response.cookies.set(COOKIE_NAME, localeInPath, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 дней
        sameSite: 'lax',
      })
    }

    // Прокидываем заголовки в ЭТОТ ЖЕ ответ
    response.headers.set('x-pathname', pathname)

    return response
  }

  // 4. ЕСЛИ ЛОКАЛИ НЕТ — РЕДИРЕКТ
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value
  const locale = (cookieLocale && LOCALES.includes(cookieLocale)) ? cookieLocale : DEFAULT_LOCALE

  const url = request.nextUrl.clone()
  const cleanPath = pathname === '/' ? '' : pathname
  url.pathname = `/${locale}${cleanPath}`

  const redirectResponse = NextResponse.redirect(url, 307)

  // Записываем куку при редиректе, если её нет
  if (cookieLocale !== locale) {
    redirectResponse.cookies.set(COOKIE_NAME, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    })
  }

  return redirectResponse
}

export const config = {
  matcher: ['/((?!api|_next|admin|favicon.ico|.*\\..*).*)', '/'],
}
