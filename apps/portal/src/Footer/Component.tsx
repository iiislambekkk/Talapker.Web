import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLanguageServer } from '@/utilities/get-language-server'
import { Logo } from '@/components/Logo/Logo'
import { CMSLink } from '@/components/Link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import Link from 'next/link'
import React from 'react'
import type { Footer as FooterType } from '@/payload-types'
import { Facebook, Instagram, Youtube, Tv } from 'lucide-react'

const iconMap = {
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  vk: <Tv className="w-4 h-4" />,
}

export async function Footer() {
  const locale = await getLanguageServer()

  // Добавляем try/catch или просто дефолтный объект, на случай если Global вообще не создан
  let footerData: FooterType | null = null
  try {
    footerData = await getCachedGlobal('footer', 1)(locale)
  } catch (error) {
    console.error('Failed to fetch footer data:', error)
  }

  // Безопасное извлечение данных с дефолтами
  const navItems = footerData?.navItems || []
  const socials = footerData?.socials || []
  const copyright = footerData?.copyright || 'Zhubanov University'
  const locationText = footerData?.locationText || 'Aktobe, Kazakhstan'

  return (
    <footer className="relative overflow-hidden" style={{ background: '#032a7a' }}>
      <div className="flex h-[3px]">
        <div className="flex-1" style={{ background: '#031b4d' }} />
        <div className="flex-1" style={{ background: '#ed1b24' }} />
        <div className="flex-1" style={{ background: '#fdc40f' }} />
      </div>

      <div className="container mx-auto px-6 pt-12 pb-8 relative">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">

          <Link href={`/${locale}`} className="flex items-center gap-3 shrink-0 group">
            <div className="p-2 bg-white/10 rounded-sm border border-white/10">
              <Logo className="h-8 w-auto" />
            </div>
            <div className="flex flex-col leading-none gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-gold">
                {locale === 'en' ? 'University' : locale === 'kk' ? 'Университеті' : 'Университет'}
              </span>
              <span className="text-xl font-black text-white uppercase tracking-tight">
                {locale === 'en' ? 'Zhubanov' : 'Жубанова'}
              </span>
            </div>
          </Link>

          {/* Проверка: Рендерим навигацию только если есть элементы */}
          {navItems.length > 0 && (
            <nav className="flex flex-col gap-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-1 text-white/40">
                {locale === 'en' ? 'Navigation' : 'Навигация'}
              </p>
              {navItems.map((item, i) => {
                // Дополнительная проверка внутри map, если вдруг link пустой
                if (!item?.link) return null
                return (
                  <CMSLink
                    key={i}
                    {...item.link}
                    className="text-sm text-white/80 hover:text-brand-gold transition-colors"
                  />
                )
              })}
            </nav>
          )}

          {/* Проверка: Рендерим соцсети только если они добавлены */}
          {socials.length > 0 && (
            <div className="flex flex-col gap-3 shrink-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
                {locale === 'en' ? 'Socials' : 'Соцсети'}
              </p>
              <div className="flex items-center gap-2">
                {socials.map((soc: any, i: number) => {
                  const Icon = iconMap[soc.platform as keyof typeof iconMap]
                  if (!soc.url) return null
                  return (
                    <a
                      key={i}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 transition-all"
                    >
                      {Icon || soc.platform}
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 shrink-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
              {locale === 'en' ? 'Appearance' : 'Оформление'}
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-white/40">Theme</span>
              <ThemeSelector />
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10 my-8 w-full" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 text-center sm:text-left">
            © {new Date().getFullYear()} {copyright}
          </p>
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/30">
            {locationText}
          </span>
        </div>
      </div>
    </footer>
  )
}
