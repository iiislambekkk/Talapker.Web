'use client'

import React, { useEffect, useState } from 'react'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { useLanguage } from "@/hooks/useLanguage"
import PageClient from './page.client'

const titles: Record<string, string> = { kk: 'Жаңалықтар', ru: 'Новости', en: 'News' }
const subtitles: Record<string, string> = {
  kk: 'К. Жұбанов атындағы университет',
  ru: 'Университет К. Жубанова',
  en: 'K. Zhubanov University',
}
const materials: Record<string, string> = {
  kk: 'материал',
  ru: 'материалов',
  en: 'articles',
}

export default function PostsPage() {
  const locale = useLanguage()
  const [posts, setPosts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/posts?locale=${locale}&limit=12&depth=1`)
        const data = await res.json()
        setPosts(data)
      } catch (err) {
        console.error("Failed to fetch posts", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [locale])

  if (loading) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <PageClient />

      {/* ── HERO HEADER ── */}
      <div className="bg-background border-b border-border relative">
        {/* ТРИКОЛОР (Brand Colors) — Тонкая декоративная линия */}
        <div className="flex h-[3px] w-full">
          <div className="bg-[#032a7a] flex-1" />
          <div className="bg-[#ed1b24] flex-1" />
          <div className="bg-[#fdc40f] flex-1" />
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-20 pb-10">
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-primary font-bold opacity-90">
            {subtitles[locale] || subtitles['kk']}
          </span>

          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mt-4 uppercase italic">
            {titles[locale] || titles['kk']}
          </h1>

          <div className="flex items-center gap-4 mt-6">
            {/* Брендовый золотой акцент */}
            <div className="h-[3px] w-12 bg-[#fdc40f]" />
            <span className="text-muted-foreground text-xs font-mono tracking-widest uppercase">
              {posts?.totalDocs || 0} {materials[locale] || materials['kk']}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between py-6 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Брендовый синий маркер */}
            <div className="w-1.5 h-6 bg-[#032a7a] dark:bg-primary rounded-sm" />
            <PageRange
              collection="posts"
              currentPage={posts?.page || 1}
              limit={12}
              totalDocs={posts?.totalDocs || 0}
            />
          </div>

          {/* Декор точки в цветах флага */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#032a7a]" />
            <div className="w-2 h-2 rounded-full bg-[#ed1b24]" />
            <div className="w-2 h-2 rounded-full bg-[#fdc40f]" />
          </div>
        </div>

        <div className="py-12">
          <CollectionArchive posts={posts?.docs || []} />
        </div>

        {posts?.totalPages > 1 && (
          <div className="pb-20 flex justify-center">
            <Pagination page={posts.page} totalPages={posts.totalPages} />
          </div>
        )}
      </div>
    </div>
  )
}
