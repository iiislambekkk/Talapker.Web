import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { buttonVariants } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getServerLang } from "@/lib/lang/getServerLang";
import { ArrowRightIcon, School2, SquareLibrary, GraduationCap, Users, LayoutDashboard, Sparkles, Map, Rocket } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type Lang = "ru" | "kk" | "en";

const t = {
    hero: {
        badge:    { ru: "Образовательная платформа", kk: "Білім беру платформасы",  en: "Education Platform"         },
        title:    { ru: "Найди свой путь в будущее",  kk: "Болашаққа жолыңды тап",   en: "Find your path to the future" },
        subtitle: { ru: "Всё что нужно для поступления — гранты, специальности, карьера", kk: "Түсу үшін қажеттінің бәрі — гранттар, мамандықтар, мансап", en: "Everything you need to enroll — grants, programs, career guidance" },
    },
    features: {
        grants:   { title: { ru: "Оценка грантов",      kk: "Грант бағалау",         en: "Grant Calculator"     }, desc: { ru: "Рассчитайте шансы на грант по баллам ЕНТ", kk: "ҰБТ балдары бойынша грант мүмкіндіктерін есептеңіз", en: "Calculate your grant chances by UNT score" } },
        map:      { title: { ru: "Карта университетов", kk: "Университеттер картасы", en: "University Map"       }, desc: { ru: "Найдите лучший вуз в вашем городе",       kk: "Қалаңыздағы үздік жоғары оқу орнын табыңыз",        en: "Find the best university in your city"   } },
        career:   { title: { ru: "Профориентация",      kk: "Кәсіптік бағдар",       en: "Career Guidance"      }, desc: { ru: "Пройдите тест и откройте свой карьерный путь", kk: "Тест тапсырып, мансап жолыңызды ашыңыз",           en: "Take a test and discover your career path" } },
        community:{ title: { ru: "Сообщество",          kk: "Қоғамдастық",           en: "Community"            }, desc: { ru: "Общайтесь с амбассадорами и студентами",   kk: "Амбассадорлар мен студенттермен сөйлесіңіз",        en: "Connect with ambassadors and students"   } },
    },
    roles: {
        heading:  { ru: "Кто вы?",                      kk: "Сіз кімсіз?",            en: "Who are you?"         },
        subheading:{ ru: "Выберите свою роль чтобы продолжить", kk: "Жалғастыру үшін рөліңізді таңдаңыз", en: "Select your role to continue" },
        prospect: {
            label: { ru: "Я абитуриент",      kk: "Мен түсуші",         en: "I'm a student"        },
            desc:  { ru: "Ищу университет и специальность", kk: "Университет пен мамандық іздеймін", en: "Looking for a university and program" },
        },
        ambassador: {
            label: { ru: "Я амбассадор",      kk: "Мен амбассадормын",  en: "I'm an ambassador"    },
            desc:  { ru: "Помогаю абитуриентам с выбором", kk: "Түсушілерге таңдауда көмектесемін", en: "Helping students make their choice" },
        },
        admin: {
            label: { ru: "Я администратор",   kk: "Мен әкімшімін",      en: "I'm an admin"         },
            desc:  { ru: "Управляю платформой учреждения", kk: "Мекеме платформасын басқарамын", en: "Managing my institution's platform" },
        },
    },
    cta: {
        universities: { ru: "ВУЗы",          kk: "ЖОО",          en: "Universities"   },
        programs:     { ru: "Специальности", kk: "Мамандықтар",  en: "Programs"       },
        career:       { ru: "Профориентация",kk: "Кәсіптік бағдар", en: "Career test" },
        grants:       { ru: "Оценить гранты",kk: "Грантты бағалау", en: "Check grants" },
    },
} as const;

const ROLE_CARDS = [
    {
        key: "prospect",
        href: "/prospect",
        icon: GraduationCap,
        gradient: "from-blue-500/10 to-indigo-500/10",
        border: "hover:border-blue-500/40",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
    },
    {
        key: "ambassador",
        href: "/ambassador",
        icon: Users,
        gradient: "from-violet-500/10 to-purple-500/10",
        border: "hover:border-violet-500/40",
        iconBg: "bg-violet-500/10",
        iconColor: "text-violet-500",
    },
    {
        key: "admin",
        href: "/institution-admin",
        icon: LayoutDashboard,
        gradient: "from-emerald-500/10 to-teal-500/10",
        border: "hover:border-emerald-500/40",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-500",
    },
] as const;

const FEATURE_CARDS = [
    { key: "grants",    icon: Sparkles, href: "/grant-changes" },
    { key: "map",       icon: Map,      href: "/grant-changes" },
    { key: "career",    icon: Rocket,   href: "/career-guidance" },
    { key: "community", icon: Users,    href: "/ambassador" },
] as const;

export default async function ForStudentsPage() {
    const lang = await getServerLang() as Lang;
    const l: Lang = (["ru", "kk", "en"] as Lang[]).includes(lang) ? lang : "en";

    return (
        <div className="space-y-20 pb-20">

            {/* ── Hero ── */}
            <section className="relative mt-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    {/* Main hero card */}
                    <Card className="relative overflow-hidden min-h-[420px] flex flex-col justify-between border-0 bg-gradient-to-br from-primary/8 to-primary/3">
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                        />
                        <CardHeader className="relative z-10 pt-8 pl-8 max-w-sm">
                            <Badge variant="secondary" className="w-fit mb-3 gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                {t.hero.badge[l]}
                            </Badge>
                            <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                                {t.hero.title[l]}
                            </CardTitle>
                            <CardDescription className="text-base mt-2 leading-relaxed">
                                {t.hero.subtitle[l]}
                            </CardDescription>
                        </CardHeader>

                        <CardFooter className="relative z-10 flex flex-wrap gap-2 pb-8 pl-8">
                            <Link href={`/${lang}/grant-changes`} className={buttonVariants({ size: "sm" })}>
                                <School2 className="w-4 h-4" />
                                {t.cta.universities[l]}
                            </Link>
                            <Link href={`/${lang}/grant-changes`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                                <SquareLibrary className="w-4 h-4" />
                                {t.cta.programs[l]}
                            </Link>
                        </CardFooter>

                        <Image
                            src="/img/girl-1.png"
                            alt="Student"
                            width={320}
                            height={620}
                            className="absolute bottom-0 right-6 h-[88%] w-auto object-contain pointer-events-none"
                        />
                    </Card>

                    {/* Right column */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">

                        {/* Grant card */}
                        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <Image
                                src="/img/books-with-hat.png"
                                alt="books"
                                width={200}
                                height={200}
                                className="absolute top-0 right-0 h-28 w-28 object-contain opacity-80"
                            />
                            <CardHeader className="pr-32">
                                <Badge variant="secondary" className="w-fit mb-1 text-xs">🎯</Badge>
                                <CardTitle className="text-xl font-bold">
                                    {t.features.grants.title[l]}
                                </CardTitle>
                                <CardDescription>{t.features.grants.desc[l]}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Link href={`/${lang}/grant-changes`} className={buttonVariants({ size: "sm" })}>
                                    {t.cta.grants[l]}
                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                </Link>
                            </CardFooter>
                        </Card>

                        {/* Career card */}
                        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <Image
                                src="/img/buddy-1.png"
                                alt="Career"
                                width={160}
                                height={240}
                                className="absolute bottom-0 right-0 h-full w-auto object-contain opacity-60 pointer-events-none"
                            />
                            <CardHeader className="pr-32">
                                <Badge variant="secondary" className="w-fit mb-1 text-xs">🚀</Badge>
                                <CardTitle className="text-xl font-bold">
                                    {t.features.career.title[l]}
                                </CardTitle>
                                <CardDescription>{t.features.career.desc[l]}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Link href={`/${lang}/career-guidance`} className={buttonVariants({ size: "sm", variant: "outline" })}>
                                    {t.cta.career[l]}
                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>

            {/* ── Role selector ── */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight mb-2">{t.roles.heading[l]}</h2>
                    <p className="text-muted-foreground">{t.roles.subheading[l]}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {ROLE_CARDS.map(({ key, href, icon: Icon, gradient, border, iconBg, iconColor }) => {
                        const role = t.roles[key as keyof typeof t.roles] as { label: Record<Lang, string>; desc: Record<Lang, string> };
                        return (
                            <Link key={key} href={`/${lang}${href}`} className="group block">
                                <Card className={cn(
                                    "h-full transition-all duration-300 hover:shadow-lg cursor-pointer border-2 border-transparent",
                                    `bg-gradient-to-br ${gradient}`,
                                    border
                                )}>
                                    <CardHeader>
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-2", iconBg)}>
                                            <Icon className={cn("w-6 h-6", iconColor)} />
                                        </div>
                                        <CardTitle className="text-lg">{role.label[l]}</CardTitle>
                                        <CardDescription className="text-sm leading-relaxed">{role.desc[l]}</CardDescription>
                                    </CardHeader>
                                    <CardFooter>
                                        <span className={cn(
                                            "flex items-center gap-1.5 text-sm font-medium transition-all duration-200 group-hover:gap-2.5",
                                            iconColor
                                        )}>
                                            {role.label[l]}
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </span>
                                    </CardFooter>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* ── Features grid ── */}
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {FEATURE_CARDS.map(({ key, icon: Icon, href }) => {
                        const feature = t.features[key as keyof typeof t.features];
                        return (
                            <Link key={key} href={`/${lang}${href}`} className="group block">
                                <Card className="h-full hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                                    <CardHeader>
                                        <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-1 group-hover:bg-primary/15 transition-colors">
                                            <Icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-base">{feature.title[l]}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc[l]}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </section>

        </div>
    );
}