import type { Metadata } from 'next'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

const LOCALES = ['kk', 'ru', 'en']

// Глубокая очистка данных от классов и функций Lexical
function sanitize<T>(data: T): T {
  if (data === null || data === undefined) return data
  return JSON.parse(JSON.stringify(data))
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return pages.docs
    ?.filter((doc) => doc.slug !== 'home')
    .flatMap((doc) => LOCALES.map((locale) => ({ locale, slug: doc.slug }))) || []
}

type Args = {
  params: Promise<{ slug?: string; locale: string }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home', locale } = await paramsPromise

  const decodedSlug = decodeURIComponent(slug)
  const url = `/${locale}/${decodedSlug}`

  const page = await queryPageBySlug({
    slug: decodedSlug,
    locale,
  })

  let rawHero: any
  let rawLayout: any

  if (!page) {
    if (slug === 'home') {
      rawHero = homeStatic.hero
      rawLayout = homeStatic.layout
    } else {
      return <PayloadRedirects url={url} />
    }
  } else {
    rawHero = page.hero
    rawLayout = page.layout
  }

  // Очищаем всё перед передачей в клиентские компоненты
  const cleanHero = sanitize(rawHero)
  const cleanLayout = sanitize(rawLayout)

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...cleanHero} />

      <RenderBlocks blocks={cleanLayout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home', locale } = await paramsPromise
  const page = await queryPageBySlug({ slug: decodeURIComponent(slug), locale })
  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: draft,
    locale: locale as any,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
