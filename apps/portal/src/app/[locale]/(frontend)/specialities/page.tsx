import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { getLanguageServer } from '@/utilities/get-language-server'

const t = {
  kk: {
    subtitle: 'К. Жұбанов атындағы университет',
    title: 'Мамандықтар',
    total: (n: number) => `${n} бағдарлама`,
    allPrograms: 'барлық деңгейдегі бағдарламалар',
    duration: (n: number) => `${n} ${n === 1 ? 'жыл' : 'жыл'}`,
    noDesc: 'Сипаттама жақында қосылады.',
  },
  ru: {
    subtitle: 'Университет К. Жубанова',
    title: 'Специальности',
    total: (n: number) => `${n} программ`,
    allPrograms: 'специальностей на всех уровнях',
    duration: (n: number) => `${n} ${n === 1 ? 'год' : n < 5 ? 'года' : 'лет'}`,
    noDesc: 'Описание скоро появится.',
  },
  en: {
    subtitle: 'K. Zhubanov University',
    title: 'Specialties',
    total: (n: number) => `${n} programs`,
    allPrograms: 'programs across all levels',
    duration: (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`,
    noDesc: 'Description coming soon.',
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

const degreeAccents: Record<string, { bar: string; badge: string }> = {
  bachelor: { bar: 'bg-[#032a7a]', badge: 'bg-[#032a7a]/10 text-[#032a7a]' },
  master:   { bar: 'bg-[#ed1b24]', badge: 'bg-[#ed1b24]/10 text-[#ed1b24]' },
  phd:      { bar: 'bg-[#fdc40f]', badge: 'bg-[#fdc40f]/20 text-amber-800' },
}

const degreeOrder = ['bachelor', 'master', 'phd']

export default async function SpecialitiesPage() {
  const locale = await getLanguageServer()
  const tr = t[locale] ?? t['ru']
  const dLabels = degreeLabels[locale] ?? degreeLabels['ru']
  const fLabels = formLabels[locale] ?? formLabels['ru']

  const payload = await getPayload({ config })

  const { docs: specialities } = await payload.find({
    collection: 'specialties',
    where: { _status: { equals: 'published' } },
    sort: 'code',
    depth: 1,
  })

  const grouped = specialities.reduce<Record<string, typeof specialities>>((acc, s) => {
    const degree = s.degree ?? 'unknown'
    if (!acc[degree]) acc[degree] = []
    acc[degree].push(s)
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

          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mt-4 uppercase italic">
            {tr.title}
          </h1>

          <div className="flex items-center gap-4 mt-6">
            <div className="h-[3px] w-12 bg-[#fdc40f]" />
            <span className="text-muted-foreground text-xs font-mono tracking-widest uppercase">
              {tr.total(specialities.length)}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#032a7a] dark:bg-primary rounded-sm" />
            <span className="text-sm text-muted-foreground font-mono">
              {specialities.length} {tr.allPrograms}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#032a7a]" />
            <div className="w-2 h-2 rounded-full bg-[#ed1b24]" />
            <div className="w-2 h-2 rounded-full bg-[#fdc40f]" />
          </div>
        </div>

        <div className="py-12 space-y-16">
          {degreeOrder.map((degree) => {
            const items = grouped[degree]
            if (!items?.length) return null
            const accent = degreeAccents[degree]

            return (
              <section key={degree}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-1 h-7 rounded-full ${accent.bar}`} />
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
                    {dLabels[degree]}
                  </h2>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold ${accent.badge}`}>
                    {items.length}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((s) => {
                    const dept = typeof s.department === 'object' ? s.department : null
                    const image = typeof s.image === 'object' && s.image ? s.image : null

                    return (
                      <Link
                        key={s.id}
                        href={`/specialities/${s.code}`}
                        className="group relative flex flex-col border border-border rounded-2xl overflow-hidden hover:border-[#032a7a]/40 hover:shadow-md transition-all duration-200 bg-background"
                      >
                        <div className={`h-[3px] w-full ${accent.bar}`} />

                        {image?.url ? (
                          <div className="relative h-36 overflow-hidden bg-muted">
                            <img
                              src={image.url}
                              alt={image.alt ?? s.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          </div>
                        ) : (
                          <div className="h-24 bg-[#032a7a]/5 dark:bg-[#032a7a]/20 flex items-end px-5 pb-3">
                            <span className="font-mono text-xs text-[#032a7a]/40 dark:text-primary/30 tracking-widest">
                              {s.code}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col flex-1 p-5">
                          <p className="text-[10px] font-mono tracking-widest text-muted-foreground mb-1.5 uppercase">
                            {s.code}
                          </p>
                          <h3 className="font-semibold text-sm leading-snug mb-3 group-hover:text-[#032a7a] dark:group-hover:text-primary transition-colors">
                            {s.title}
                          </h3>

                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {s.duration && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {tr.duration(s.duration)}
                              </span>
                            )}
                            {Array.isArray(s.form) && s.form.map((f) => (
                              <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#032a7a]/10 text-[#032a7a] dark:bg-primary/20 dark:text-primary">
                                {fLabels[f] ?? f}
                              </span>
                            ))}
                          </div>

                          {dept && (
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#fdc40f] flex-shrink-0" />
                              <p className="text-[11px] text-muted-foreground truncate">{dept.title}</p>
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
