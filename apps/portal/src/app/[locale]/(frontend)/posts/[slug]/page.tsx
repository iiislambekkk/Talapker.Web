import type { Metadata } from 'next'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Calendar, Building2 } from 'lucide-react'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return posts.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
  searchParams: Promise<{ locale?: string }>
}

export default async function Post({ params: paramsPromise, searchParams: searchParamsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const { locale = 'kk' } = await searchParamsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug, locale, draft })

  if (!post) return <PayloadRedirects url={url} />

  const heroImage =
    post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null
  const heroImageUrl = heroImage && 'url' in heroImage ? (heroImage as any).url : null

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null

  const categories =
    post.categories?.filter((c): c is { id: string; title: string } => typeof c === 'object') ?? []

  return (
    <article className="min-h-screen bg-background">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      {/* ── HERO ── */}
      <div className="relative w-full">
        <div className="relative w-full overflow-hidden h-[360px] md:h-[460px]">
          {heroImageUrl ? (
            <>
              <Image
                src={heroImageUrl}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(3,42,122,0.85) 0%, rgba(3,42,122,0.3) 50%, rgba(3,42,122,0.05) 100%)',
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-brand-dark" />
          )}

          {/* Триколор */}
          <div className="absolute top-0 inset-x-0 flex h-[3px] z-10">
            <div className="flex-1 bg-brand-blue" />
            <div className="flex-1 bg-brand-red" />
            <div className="flex-1 bg-brand-gold" />
          </div>

          {/* Заголовок поверх */}
          <div className="absolute bottom-0 inset-x-0">
            <div className="max-w-4xl mx-auto px-6 pb-10">

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] px-2.5 py-1 rounded-sm bg-brand-blue/80 border border-white/20"
                      style={{ color: '#ffffff' }}
                    >
                      {cat.title}
                    </span>
                  ))}
                </div>
              )}

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight"
                style={{ color: '#ffffff' }}
              >
                {post.title}
              </h1>

              {publishedDate && (
                <div className="flex flex-wrap items-center gap-4 mt-5">
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    <time>{publishedDate}</time>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Университет К. Жубанова</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back nav */}
        <div className="bg-background border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href="/posts">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Все публикации
              </Link>
            </Button>
            <div className="hidden sm:flex items-center gap-1.5 ml-auto">
              <div className="w-2 h-2 rounded-full bg-brand-blue" />
              <div className="w-2 h-2 rounded-full bg-brand-red" />
              <div className="w-2 h-2 rounded-full bg-brand-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="w-10 h-1 mb-8 rounded-full bg-gradient-to-r from-brand-blue via-brand-red to-brand-gold" />
        <RichText
          className="
            prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-black prose-headings:tracking-tight
            prose-p:text-foreground/85 prose-p:leading-relaxed
            prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
            dark:prose-a:text-blue-400
            prose-blockquote:not-italic prose-blockquote:border-brand-blue
            dark:prose-blockquote:border-blue-400
            prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1.5
            prose-strong:text-foreground
          "
          data={post.content}
          enableGutter={false}
        />
      </div>

      {/* ── RELATED POSTS ── */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className="border-t border-border bg-muted/40">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1 h-6 rounded-full bg-brand-blue" />
              <p className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Читайте также
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {post.relatedPosts
                .filter((p): p is any => typeof p === 'object')
                .slice(0, 3)
                .map((related: any) => {
                  const relImg =
                    related.heroImage &&
                    typeof related.heroImage === 'object' &&
                    'url' in related.heroImage
                      ? (related.heroImage as any).url
                      : null
                  return (
                    <Card
                      key={related.id}
                      className="group overflow-hidden hover:shadow-lg transition-all duration-200 border-border"
                    >
                      <Link href={`/posts/${related.slug}`}>
                        {relImg ? (
                          <div className="overflow-hidden aspect-video bg-muted">
                            <img
                              src={relImg}
                              alt={related.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-gradient-to-br from-brand-blue to-brand-dark" />
                        )}
                        <div className="h-[2px] w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-brand-blue via-brand-red to-brand-gold" />
                        <CardContent className="p-4">
                          <p className="font-bold text-card-foreground leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity duration-200">
                            {related.title}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-brand-blue dark:text-blue-400">
                            Читать →
                          </span>
                        </CardContent>
                      </Link>
                    </Card>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export async function generateMetadata({
                                         params: paramsPromise,
                                         searchParams: searchParamsPromise,
                                       }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const { locale = 'kk' } = await searchParamsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, locale, draft: false })
  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({
                                       slug,
                                       locale,
                                       draft,
                                     }: {
  slug: string
  locale: string
  draft: boolean
}) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    locale: locale as 'kk' | 'ru' | 'en',
    fallbackLocale: 'kk',
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})
