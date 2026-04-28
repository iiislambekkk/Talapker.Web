import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { getLanguageServer } from '@/utilities/get-language-server'

const t = {
  kk: {
    subtitle: 'К. Жұбанов атындағы университет',
    title: 'Профессорлық-оқытушылық құрам',
    total: (n: number) => `${n} оқытушы`,
    allMembers: 'барлық мүшелер',
  },
  ru: {
    subtitle: 'Университет К. Жубанова',
    title: 'Профессорско-преподавательский состав',
    total: (n: number) => `${n} преподавателей`,
    allMembers: 'членов состава',
  },
  en: {
    subtitle: 'K. Zhubanov University',
    title: 'Faculty Members',
    total: (n: number) => `${n} members`,
    allMembers: 'faculty members',
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

const titleAccents: Record<string, string> = {
  professor: 'bg-[#032a7a]/10 text-[#032a7a]',
  associate: 'bg-[#ed1b24]/10 text-[#ed1b24]',
  senior: 'bg-[#fdc40f]/20 text-amber-800',
  lecturer: 'bg-emerald-100 text-emerald-800',
  assistant: 'bg-gray-100 text-gray-600',
}

export default async function FacultyPage() {
  const locale = await getLanguageServer()
  const tr = t[locale] ?? t['ru']
  const dLabels = degreeLabels[locale] ?? degreeLabels['ru']
  const tLabels = titleLabels[locale] ?? titleLabels['ru']

  const payload = await getPayload({ config })

  const { docs: members } = await payload.find({
    collection: 'faculty-members',
    where: { _status: { equals: 'published' } },
    sort: 'fullName',
    depth: 1,
    limit: 200,
  })

  // Группируем по кафедре
  const grouped = members.reduce<Record<string, typeof members>>((acc, m) => {
    const dept = typeof m.department === 'object' && m.department
      ? (m.department as any).title ?? 'other'
      : 'other'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(m)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">

      {/* ── HERO ── */}
      <div className="bg-background border-b border-border relative">
        <div className="flex h-[3px] w-full">
          <div className="bg-[#032a7a] flex-1" />
          <div className="bg-[#ed1b24] flex-1" />
          <div className="bg-[#fdc40f] flex-1" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-10">
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#032a7a] dark:text-primary font-bold opacity-90">
            {tr.subtitle}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mt-4 uppercase italic max-w-3xl">
            {tr.title}
          </h1>
          <div className="flex items-center gap-4 mt-6">
            <div className="h-[3px] w-12 bg-[#fdc40f]" />
            <span className="text-muted-foreground text-xs font-mono tracking-widest uppercase">
              {tr.total(members.length)}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#032a7a] dark:bg-primary rounded-sm" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              {members.length} {tr.allMembers}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#032a7a]" />
            <div className="w-2 h-2 rounded-full bg-[#ed1b24]" />
            <div className="w-2 h-2 rounded-full bg-[#fdc40f]" />
          </div>
        </div>

        <div className="py-12 space-y-16">
          {Object.entries(grouped).map(([deptName, items]) => (
            <section key={deptName}>
              {/* Заголовок кафедры */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-7 rounded-full bg-[#032a7a]" />
                <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
                  {deptName === 'other' ? '—' : deptName}
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold bg-[#032a7a]/10 text-[#032a7a]">
                  {items.length}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((m) => {
                  const photo = typeof m.photo === 'object' && m.photo ? m.photo : null
                  const slug = (m as any).slug

                  return (
                    <Link
                      key={m.id}
                      href={`/pps/${slug}`}
                      className="group flex flex-col border border-border rounded-2xl overflow-hidden hover:border-[#032a7a]/40 hover:shadow-md transition-all duration-200 bg-background"
                    >
                      {/* Фото */}
                      <div className="relative bg-[#032a7a]/5 dark:bg-[#032a7a]/20 overflow-hidden aspect-[3/4]">
                        {photo?.url ? (
                          <Image
                            src={photo.url}
                            alt={m.fullName}
                            fill
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-black text-[#032a7a]/20 dark:text-primary/20 tracking-tighter select-none">
                              {m.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="flex flex-col flex-1 p-4">
                        <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-[#032a7a] dark:group-hover:text-primary transition-colors">
                          {m.fullName}
                        </h3>

                        {m.position && (
                          <p className="text-xs text-muted-foreground mb-3 leading-snug">
                            {m.position}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {m.academicTitle && (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${titleAccents[m.academicTitle] ?? 'bg-muted text-muted-foreground'}`}>
                              {tLabels[m.academicTitle] ?? m.academicTitle}
                            </span>
                          )}
                          {m.academicDegree && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {dLabels[m.academicDegree] ?? m.academicDegree}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
