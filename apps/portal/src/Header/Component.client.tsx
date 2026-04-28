'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/utilities/ui'

interface HeaderClientProps {
  data: Header,
  locale: string
}

const langs = ['kk', 'ru', 'en'] as const
type Lang = (typeof langs)[number]

const langLabels: Record<Lang, string> = { kk: 'ҚАЗ', ru: 'РУС', en: 'ENG' }
const universityName: Record<Lang, string> = { kk: 'Жұбанов', ru: 'Жубанов', en: 'Zhubanov' }
const universityLabel: Record<Lang, string> = { kk: 'Университеті', ru: 'Университет', en: 'University' }

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, locale }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()

  const pathname = usePathname()
  const router = useRouter()

  // 1. Определяем текущий язык из первого сегмента пути
  const segments = pathname.split('/')
  const currentLang = (langs.includes(segments[1] as any) ? segments[1] : 'kk') as Lang

  // 2. Обновленная логика смены языка через сегменты пути
  const switchLang = useCallback(
    (lang: Lang) => {
      const newSegments = [...segments]

      // Заменяем или вставляем локаль в сегмент [1]
      if (langs.includes(newSegments[1] as any)) {
        newSegments[1] = lang
      } else {
        newSegments.splice(1, 0, lang)
      }

      const newPath = newSegments.join('/') || '/'
      router.push(newPath)
    },
    [pathname, router, segments],
  )

  useEffect(() => { setHeaderTheme(null) }, [pathname, setHeaderTheme])
  useEffect(() => { if (headerTheme && headerTheme !== theme) setTheme(headerTheme) }, [headerTheme, theme])
  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const LangSwitcher = ({ mobile = false }: { mobile?: boolean }) => {
    const pathname = usePathname()

    // Определяем текущий язык из URL (первый сегмент)
    const segments = pathname?.split('/') || []
    const currentLang = langs.includes(segments[1] as Lang) ? segments[1] : 'kk'

    // Функция для формирования нового URL при клике
    const getNewPathname = (targetLang: string) => {
      if (!pathname) return `/${targetLang}`
      const newSegments = [...segments]

      if (langs.includes(newSegments[1] as Lang)) {
        newSegments[1] = targetLang
      } else {
        newSegments.splice(1, 0, targetLang)
      }

      return newSegments.join('/') || '/'
    }

    return (
      <div className={cn('flex items-center', mobile ? 'gap-1' : 'gap-0.5')}>
        {langs.map((lang, i) => {
          const isActive = currentLang === lang

          return (
            <React.Fragment key={lang}>
              <Link
                href={getNewPathname(lang)}
                style={{
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                }}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-widest rounded transition-all duration-150 outline-none',
                  mobile ? 'text-xs' : '',
                )}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
                }}
              >
                {langLabels[lang as Lang]}
              </Link>

              {/* Твоя разделительная черта */}
              {i < langs.length - 1 && (
                <span
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                  className="text-xs select-none"
                >
                |
              </span>
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }


  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: '#032a7a',
          boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.08), 0 4px 24px rgba(3,42,122,0.4)' : 'none',
        }}
        {...(theme ? { 'data-theme': theme } : {})}
      >
        {/* Триколор */}
        <div className="flex h-[3px]">
          <div className="flex-1" style={{ background: '#031b4d' }} />
          <div className="flex-1" style={{ background: '#ed1b24' }} />
          <div className="flex-1" style={{ background: '#fdc40f' }} />
        </div>

        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-14 gap-6">

            {/* Logo + name */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <Logo
                loading="eager"
                priority="high"
                className="h-7 w-auto"
              />
              <div className="flex flex-col leading-none gap-0.5">
                <span
                  className="text-[10px] font-mono uppercase tracking-[0.3em]"
                  style={{ color: '#fdc40f' }}
                >
                  {universityLabel[currentLang]}
                </span>
                <span
                  className="text-lg font-black tracking-tight transition-opacity duration-200 group-hover:opacity-75"
                  style={{ color: '#ffffff' }}
                >
                  {universityName[currentLang]}
                </span>
              </div>
            </Link>

            {/* Right: nav + lang + burger */}
            <div className="flex items-center gap-3 shrink-0">
              <HeaderNav data={data} locale={locale} />

              <div
                className="hidden sm:flex items-center rounded-md px-1"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <LangSwitcher />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 hover:bg-white/10"
                style={{ color: '#ffffff' }}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Меню"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute top-0 right-0 h-full w-72 flex flex-col pt-16 px-6 pb-8 gap-6 shadow-2xl"
            style={{ background: '#032a7a', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 hover:bg-white/10"
              style={{ color: '#ffffff' }}
              onClick={() => setMenuOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Drawer header */}
            <div
              className="flex items-center gap-3 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
            >
              <Logo className="h-7 w-auto" />
              <div className="flex flex-col leading-none gap-0.5">
                <span
                  className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: '#fdc40f' }}
                >
                  {universityLabel[currentLang]}
                </span>
                <span
                  className="text-base font-black"
                  style={{ color: '#ffffff' }}
                >
                  {universityName[currentLang]}
                </span>
              </div>
            </div>

            <HeaderNav data={data} locale={locale} />

            <div className="mt-auto flex flex-col gap-3">
              <p
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Язык / Тіл / Language
              </p>
              <LangSwitcher mobile />
            </div>

            {/* Bottom tricolor */}
            <div className="flex h-[3px] -mx-6 -mb-8 mt-2">
              <div className="flex-1" style={{ background: '#032a7a' }} />
              <div className="flex-1" style={{ background: '#ed1b24' }} />
              <div className="flex-1" style={{ background: '#fdc40f' }} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
