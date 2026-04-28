'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { useLanguage } from "@/hooks/useLanguage"

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const locale = useLanguage()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  return (
    <section
      className="relative -mt-[10.4rem] min-h-[90vh] flex items-center justify-center overflow-hidden bg-brand-dark"
      data-theme="dark"
    >
      {/* 1. Background с параллакс-эффектом (scale) */}
      <div className="absolute inset-0 z-0">
        {media && typeof media === 'object' && (
          <Media
            fill
            imgClassName="object-cover transition-transform duration-[3s] scale-110 group-hover:scale-100"
            priority
            resource={media}
          />
        )}
        {/* Более сложный градиент для "глубины" */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-brand-dark/20 z-10" />
      </div>

      {/* 2. Content Container */}
      <div className="container relative z-20 px-6 py-32 mt-20">
        <div className="max-w-[52rem] mx-auto flex flex-col items-center">

          {/* Typography */}
          {richText && (
            <div className="prose-hero text-center">
              <RichText
                className="mb-12 text-white leading-[1.05] tracking-tight font-medium"
                data={richText}
                enableGutter={false}
              />
            </div>
          )}

          {/* Modern Buttons Section */}
          {Array.isArray(links) && links.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4 w-full animate-fade-in-up">
              {links.map(({ link }, i) => {
                const isPrimary = i === 0
                return (
                  <CMSLink
                    key={i}
                    {...link}
                    appearance={isPrimary ? 'default' : 'outline'} // 'default' будет красным, 'outline' - стеклянным
                    className="px-10 py-6"
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Элегантный блюр-декор по краям (Modern touch) */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px] pointer-events-none" />
    </section>
  )
}
