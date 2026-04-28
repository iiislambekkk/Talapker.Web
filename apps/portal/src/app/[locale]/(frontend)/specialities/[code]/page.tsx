import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getLanguageServer } from '@/utilities/get-language-server'
import RichText from '@/components/RichText'

const t = {
  kk: {
    breadcrumb: 'Мамандықтар',
    about: 'Бағдарлама туралы',
    noDesc: 'Бағдарлама сипаттамасы жақында қосылады.',
    docsTitle: 'Оқу жоспарлары мен құжаттар',
    programDetails: 'Бағдарлама мәліметтері',
    code: 'Код',
    level: 'Деңгей',
    duration: 'Мерзім',
    form: 'Нысаны',
    department: 'Кафедра',
    updatedAt: 'Өзектілік',
    back: 'Барлық мамандықтар',
    studyPlans: 'оқу жоспарлары',
    docCount: (n: number) => `${n} ${n === 1 ? 'құжат' : 'құжат'}`,
    durationFn: (n: number) => `${n} жыл`,
  },
  ru: {
    breadcrumb: 'Специальности',
    about: 'О программе',
    noDesc: 'Описание программы скоро появится.',
    docsTitle: 'Учебные планы и документы',
    programDetails: 'Детали программы',
    code: 'Код',
    level: 'Уровень',
    duration: 'Срок',
    form: 'Форма',
    department: 'Кафедра',
    updatedAt: 'Актуально с',
    back: 'Все специальности',
    studyPlans: 'учебные планы',
    docCount: (n: number) => `${n} ${n === 1 ? 'документ' : n < 5 ? 'документа' : 'документов'}`,
    durationFn: (n: number) => `${n} ${n === 1 ? 'год' : n < 5 ? 'года' : 'лет'}`,
  },
  en: {
    breadcrumb: 'Specialties',
    about: 'About the program',
    noDesc: 'Program description coming soon.',
    docsTitle: 'Study plans and documents',
    programDetails: 'Program details',
    code: 'Code',
    level: 'Level',
    duration: 'Duration',
    form: 'Format',
    department: 'Department',
    updatedAt: 'Active since',
    back: 'All specialties',
    studyPlans: 'study plans',
    docCount: (n: number) => `${n} ${n === 1 ? 'document' : 'documents'}`,
    durationFn: (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`,
  },
}

const degreeLabels: Record<string, Record<string, string>> = {
  kk: { bachelor: 'Бакалавриат', master: 'Магистратура', phd: 'Докторантура' },
  ru: { bachelor: 'Бакалавриат', master: 'Магистратура', phd: 'Докторантура' },
  en: { bachelor: 'Bachelor', master: 'Master', phd: 'PhD' },
}

const formLabels: Record<string, Record<string, string>> = {
  kk: { 'full-time': 'Күндізгі', 'part-time': 'Сырттай' },
  ru: { 'full-time': 'Очная', 'part-time': 'Заочная' },
  en: { 'full-time': 'Full-time', 'part-time': 'Part-time' },
}

type Props = { params: { code: string } }

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'specialties',
    where: { _status: { equals: 'published' } },
    limit: 1000,
  })
  return docs.map((s) => ({ code: s.code }))
}

export async function generateMetadata({ params }: Props) {
  const payload = await getPayload({ config })
  const locale = await getLanguageServer()
  const dLabels = degreeLabels[locale] ?? degreeLabels['ru']
  const tr = t[locale] ?? t['ru']

  const { docs } = await payload.find({
    collection: 'specialties',
    where: { code: { equals: params.code }, _status: { equals: 'published' } },
    limit: 1,
  })
  const s = docs[0]
  if (!s) return {}
  return {
    title: `${s.title} — ${s.code}`,
    description: `${dLabels[s.degree ?? '']} · ${tr.durationFn(s.duration ?? 0)}`,
  }
}

export default async function SpecialityPage({ params }: Props) {
  const locale = await getLanguageServer()
  const tr = t[locale] ?? t['ru']
  const dLabels = degreeLabels[locale] ?? degreeLabels['ru']
  const fLabels = formLabels[locale] ?? formLabels['ru']

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'specialties',
    where: {
      code: { equals: params.code },
      _status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
  })

  const s = docs[0]
  if (!s) notFound()

  const image = s.image && typeof s.image === 'object' ? s.image : null
  const department = s.department && typeof s.department === 'object' ? s.department : null
  const documents = Array.isArray(s.documents)
    ? s.documents.filter((d): d is Extract<typeof d, { id: string }> => typeof d === 'object')
    : []

  const durationLabel = s.duration ? tr.durationFn(s.duration) : null

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO ── */}
      <div className="relative bg-[#032a7a] text-white overflow-hidden">
        <div className="flex h-[3px] w-full">
          <div className="bg-[#032a7a] flex-1" />
          <div className="bg-[#ed1b24] flex-1" />
          <div className="bg-[#fdc40f] flex-1" />
        </div>

        {image?.url && (
          <>
            <Image
              src={image.url}
              alt={image.alt ?? s.title}
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#032a7a] via-[#032a7a]/80 to-[#032a7a]/60" />
          </>
        )}

        <div className="absolute right-8 top-8 flex flex-col gap-2 opacity-20">
          <div className="w-3 h-3 rounded-full bg-white" />
          <div className="w-3 h-3 rounded-full bg-[#ed1b24]" />
          <div className="w-3 h-3 rounded-full bg-[#fdc40f]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-14">
          <div className="flex items-center gap-2 mb-8 text-white/50 text-xs font-mono">
            <Link href="/specialities" className="hover:text-white transition-colors">
              {tr.breadcrumb}
            </Link>
            <span>/</span>
            <span className="text-white/70">{s.code}</span>
          </div>

          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#fdc40f] font-bold">
            {dLabels[s.degree ?? '']}
          </span>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mt-3 uppercase italic max-w-3xl">
            {s.title}
          </h1>

          <div className="flex items-center gap-4 mt-6">
            <div className="h-[3px] w-12 bg-[#fdc40f]" />
            <span className="text-white/60 text-xs font-mono tracking-widest uppercase">
              {s.code}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {durationLabel && (
              <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-white/20 text-white/80">
                {durationLabel}
              </span>
            )}
            {Array.isArray(s.form) && s.form.map((f) => (
              <span key={f} className="text-xs font-mono px-3 py-1.5 rounded-full border border-white/20 text-white/80">
                {fLabels[f] ?? f}
              </span>
            ))}
            {department && (
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-[#fdc40f]/20 border border-[#fdc40f]/40 text-[#fdc40f]">
                {department.title}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#032a7a] dark:bg-primary rounded-sm" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {tr.about}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#032a7a]" />
            <div className="w-2 h-2 rounded-full bg-[#ed1b24]" />
            <div className="w-2 h-2 rounded-full bg-[#fdc40f]" />
          </div>
        </div>

        <div className="py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-12">
            {s.description ? (
              <div className="prose prose-gray dark:prose-invert max-w-none leading-relaxed">
                <RichText data={s.description} />
              </div>
            ) : (
              <p className="text-muted-foreground font-mono text-sm">{tr.noDesc}</p>
            )}

            {documents.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-5 rounded-full bg-[#ed1b24]" />
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
                    {tr.docsTitle}
                  </h2>
                </div>
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li key={doc.id}>
                      <a
                      href={doc.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border hover:border-[#032a7a]/40 hover:bg-[#032a7a]/5 dark:hover:bg-primary/10 transition-all group"
                      >
                      <div className="w-8 h-8 rounded-lg bg-[#032a7a]/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#032a7a] dark:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-[#032a7a] dark:group-hover:text-primary truncate transition-colors">
                          {doc.title ?? doc.filename}
                        </p>
                        {doc.filename && doc.title && (
                          <p className="text-xs text-muted-foreground font-mono truncate">{doc.filename}</p>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-muted-foreground group-hover:text-[#032a7a] dark:group-hover:text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                    </li>
                    ))}
                </ul>
              </section>
              )}
          </div>

          {/* Сайдбар */}
          <aside className="space-y-4">
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <div className="w-1 h-4 rounded-full bg-[#fdc40f]" />
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                  {tr.programDetails}
                </p>
              </div>
              <div className="divide-y divide-border">
                <div className="px-5 py-3.5 flex justify-between items-center gap-4">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{tr.code}</span>
                  <span className="text-sm font-mono font-semibold text-[#032a7a] dark:text-primary">{s.code}</span>
                </div>
                {s.degree && (
                  <div className="px-5 py-3.5 flex justify-between items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{tr.level}</span>
                    <span className="text-sm font-medium">{dLabels[s.degree]}</span>
                  </div>
                )}
                {durationLabel && (
                  <div className="px-5 py-3.5 flex justify-between items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{tr.duration}</span>
                    <span className="text-sm font-medium">{durationLabel}</span>
                  </div>
                )}
                {Array.isArray(s.form) && s.form.length > 0 && (
                  <div className="px-5 py-3.5 flex justify-between items-start gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{tr.form}</span>
                    <div className="text-right space-y-1">
                      {s.form.map((f) => (
                        <p key={f} className="text-sm font-medium">{fLabels[f] ?? f}</p>
                      ))}
                    </div>
                  </div>
                )}
                {department && (
                  <div className="px-5 py-3.5 flex justify-between items-start gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex-shrink-0">{tr.department}</span>
                    <span className="text-sm font-medium text-right leading-snug">{department.title}</span>
                  </div>
                )}
                {s.publishedAt && (
                  <div className="px-5 py-3.5 flex justify-between items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{tr.updatedAt}</span>
                    <span className="text-sm font-mono">
                      {new Date(s.publishedAt).toLocaleDateString(
                        locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU',
                        { day: 'numeric', month: 'short', year: 'numeric' }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {documents.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-4 border border-border rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{tr.docCount(documents.length)}</p>
                  <p className="text-xs text-muted-foreground font-mono">{tr.studyPlans}</p>
                </div>
              </div>
            )}

            <Link
              href="/specialities"
              className="flex items-center gap-2 px-5 py-3.5 border border-border rounded-2xl hover:border-[#032a7a]/40 hover:bg-[#032a7a]/5 transition-all group"
            >
              <svg className="w-4 h-4 text-muted-foreground group-hover:text-[#032a7a] dark:group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-xs font-mono text-muted-foreground group-hover:text-[#032a7a] dark:group-hover:text-primary uppercase tracking-widest">
                {tr.back}
              </span>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
