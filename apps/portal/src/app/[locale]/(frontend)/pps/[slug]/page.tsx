import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import RichText from '@/components/RichText'
import { getLanguageServer } from '@/utilities/get-language-server'

const t = {
  kk: {
    breadcrumb: 'ПОҚ',
    back: 'Барлық оқытушылар',
    about: 'Өмірбаян',
    noDesc: 'Өмірбаян жақында қосылады.',
    disciplines: 'Оқытылатын пәндер',
    details: 'Мәліметтер',
    position: 'Лауазымы',
    degree: 'Ғылыми дәрежесі',
    title: 'Ғылыми атағы',
    department: 'Кафедра',
    email: 'Электрондық пошта',
    publishedAt: 'Өзектілік',
  },
  ru: {
    breadcrumb: 'ППС',
    back: 'Все преподаватели',
    about: 'Биография',
    noDesc: 'Биография скоро появится.',
    disciplines: 'Преподаваемые дисциплины',
    details: 'Сведения',
    position: 'Должность',
    degree: 'Учёная степень',
    title: 'Учёное звание',
    department: 'Кафедра',
    email: 'Электронная почта',
    publishedAt: 'Актуально с',
  },
  en: {
    breadcrumb: 'Faculty',
    back: 'All members',
    about: 'Biography',
    noDesc: 'Biography coming soon.',
    disciplines: 'Taught disciplines',
    details: 'Details',
    position: 'Position',
    degree: 'Academic degree',
    title: 'Academic title',
    department: 'Department',
    email: 'Email',
    publishedAt: 'Active since',
  },
}

const degreeLabels: Record<string, Record<string, string>> = {
  kk: { candidate: 'Ғылым кандидаты', doctor: 'Ғылым докторы', phd: 'PhD', master: 'Магистр' },
  ru: { candidate: 'Кандидат наук', doctor: 'Доктор наук', phd: 'PhD', master: 'Магистр' },
  en: { candidate: 'Candidate of Sciences', doctor: 'Doctor of Sciences', phd: 'PhD', master: 'Master' },
}

const titleLabels: Record<string, Record<string, string>> = {
  kk: { professor: 'Профессор', associate: 'Доцент', senior: 'Аға оқытушы', lecturer: 'Оқытушы', assistant: 'Ассистент' },
  ru: { professor: 'Профессор', associate: 'Доцент', senior: 'Старший преподаватель', lecturer: 'Преподаватель', assistant: 'Ассистент' },
  en: { professor: 'Professor', associate: 'Associate Professor', senior: 'Senior Lecturer', lecturer: 'Lecturer', assistant: 'Assistant' },
}

const titleBarColors: Record<string, string> = {
  professor: 'bg-[#032a7a]',
  associate: 'bg-[#ed1b24]',
  senior: 'bg-[#fdc40f]',
  lecturer: 'bg-emerald-500',
  assistant: 'bg-gray-400',
}

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'faculty-members',
    where: { _status: { equals: 'published' } },
    limit: 1000,
  })
  return docs.map((m) => ({ slug: (m as any).slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const locale = await getLanguageServer()
  const { docs } = await payload.find({
    collection: 'faculty-members',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    locale: locale as any,
  })
  const m = docs[0]
  if (!m) return {}
  return { title: `${m.fullName} — ${(titleLabels[locale] ?? titleLabels['ru'])[m.academicTitle ?? '']}` }
}

export default async function FacultyMemberPage({ params }: Props) {
  const { slug } = await params

  const locale = await getLanguageServer()
  const tr = t[locale] ?? t['ru']
  const dLabels = degreeLabels[locale] ?? degreeLabels['ru']
  const tLabels = titleLabels[locale] ?? titleLabels['ru']

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'faculty-members',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 2,
    limit: 1,
    locale: locale as any,
  })

  const m = docs[0]
  if (!m) notFound()

  const photo = m.photo && typeof m.photo === 'object' ? m.photo : null
  const department = m.department && typeof m.department === 'object' ? m.department : null
  const disciplines = Array.isArray(m.disciplines) ? m.disciplines : []
  const barColor = titleBarColors[m.academicTitle ?? ''] ?? 'bg-[#032a7a]'

  const initials = m.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO ── */}
      <div className="relative bg-[#032a7a] text-white overflow-hidden">
        <div className="flex h-[3px] w-full">
          <div className="bg-[#032a7a] flex-1" />
          <div className="bg-[#ed1b24] flex-1" />
          <div className="bg-[#fdc40f] flex-1" />
        </div>

        {/* Декор */}
        <div className="absolute right-8 top-8 flex flex-col gap-2 opacity-20">
          <div className="w-3 h-3 rounded-full bg-white" />
          <div className="w-3 h-3 rounded-full bg-[#ed1b24]" />
          <div className="w-3 h-3 rounded-full bg-[#fdc40f]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-10 text-white/50 text-xs font-mono">
            <Link href="/pps" className="hover:text-white transition-colors">
              {tr.breadcrumb}
            </Link>
            <span>/</span>
            <span className="text-white/70 truncate max-w-xs">{m.fullName}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Фото */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-white/20 bg-[#032a7a]/60">
                {photo?.url ? (
                  <Image
                    src={photo.url}
                    alt={m.fullName}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl font-black text-white/20 tracking-tighter select-none">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              {/* Цветная полоска снизу фото по званию */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${barColor} rounded-b-2xl`} />
            </div>

            {/* Имя и метаданные */}
            <div className="flex-1 min-w-0">
              {m.academicTitle && (
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#fdc40f] font-bold">
                  {tLabels[m.academicTitle]}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-none mt-2 uppercase italic">
                {m.fullName}
              </h1>

              {m.position && (
                <p className="text-white/70 text-sm mt-3 font-mono">{m.position}</p>
              )}

              <div className="flex items-center gap-4 mt-5">
                <div className="h-[3px] w-12 bg-[#fdc40f]" />
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                {m.academicDegree && (
                  <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-white/20 text-white/80">
                    {dLabels[m.academicDegree]}
                  </span>
                )}
                {department && (
                  <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-[#fdc40f]/20 border border-[#fdc40f]/40 text-[#fdc40f]">
                    {(department as any).title}
                  </span>
                )}
                {m.email && (
                  <a
                  href={`mailto:${m.email}`}
                  className="text-xs font-mono px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                  >
                {m.email}
                  </a>
                  )}
              </div>
            </div>
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
            {m.bio ? (
              <div className="prose prose-gray dark:prose-invert max-w-none leading-relaxed">
                <RichText data={m.bio} />
              </div>
            ) : (
              <p className="text-muted-foreground font-mono text-sm">{tr.noDesc}</p>
            )}

            {/* Дисциплины */}
            {disciplines.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-5 rounded-full bg-[#ed1b24]" />
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
                    {tr.disciplines}
                  </h2>
                </div>
                <ul className="space-y-2">
                  {disciplines.map((d, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border">
                      <span className="text-[10px] font-mono text-[#032a7a] dark:text-primary font-bold w-5 text-right flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="w-px h-4 bg-border flex-shrink-0" />
                      <span className="text-sm">{d.name}</span>
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
                  {tr.details}
                </p>
              </div>
              <div className="divide-y divide-border">
                {m.position && (
                  <div className="px-5 py-3.5 flex justify-between items-start gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex-shrink-0">{tr.position}</span>
                    <span className="text-sm font-medium text-right leading-snug">{m.position}</span>
                  </div>
                )}
                {m.academicDegree && (
                  <div className="px-5 py-3.5 flex justify-between items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{tr.degree}</span>
                    <span className="text-sm font-medium">{dLabels[m.academicDegree]}</span>
                  </div>
                )}
                {m.academicTitle && (
                  <div className="px-5 py-3.5 flex justify-between items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{tr.title}</span>
                    <span className="text-sm font-medium">{tLabels[m.academicTitle]}</span>
                  </div>
                )}
                {department && (
                  <div className="px-5 py-3.5 flex justify-between items-start gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex-shrink-0">{tr.department}</span>
                    <span className="text-sm font-medium text-right leading-snug">{(department as any).title}</span>
                  </div>
                )}
                {m.email && (
                  <div className="px-5 py-3.5 flex justify-between items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{tr.email}</span>
                    <a
                    href={`mailto:${m.email}`}
                    className="text-sm text-[#032a7a] dark:text-primary hover:underline font-mono truncate max-w-[180px]"
                    >
                    {m.email}
                  </a>
                  </div>
                  )}
                {m.publishedAt && (
                  <div className="px-5 py-3.5 flex justify-between items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{tr.publishedAt}</span>
                    <span className="text-sm font-mono">
                      {new Date(m.publishedAt).toLocaleDateString(
                        locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU',
                        { day: 'numeric', month: 'short', year: 'numeric' }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Назад */}
            <Link
              href="/pps"
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
