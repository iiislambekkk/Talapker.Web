import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import type { Config } from '@/payload-types'

type Global = keyof Config['globals']

// 1. Чистая функция запроса к БД
async function getGlobal(slug: Global, locale: string, depth = 0) {
  const payload = await getPayload({ config: configPromise })
  return await payload.findGlobal({
    slug,
    depth,
    locale: locale as any,
  })
}

// 2. Обертка с правильным кэшированием
export const getCachedGlobal = (slug: Global, depth = 0) => {
  return async (locale: string) => {
    // ВАЖНО: unstable_cache должен вызываться внутри,
    // чтобы locale попал в массив ключей [slug, locale]
    return unstable_cache(
      async () => getGlobal(slug, locale, depth),
      [slug, locale], // Ключи кэша: теперь RU и KK — это разные записи
      {
        tags: [`global_${slug}`, `global_${slug}_${locale}`],
      }
    )()
  }
}
