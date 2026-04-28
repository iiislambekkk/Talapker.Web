"use client"
import React from 'react';
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/hooks/useLang";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
    BookText, Building2, Clock, Star, GraduationCap, Languages,
    ArrowLeft, Hash, Info, Briefcase, MapPin, BookOpen,
    TrendingUp, Award, ChevronRight, BarChart3
} from 'lucide-react';
import { EducationProgramDto, GrantCompetitionType, StudyForm } from "@/Data/models/Faculty";
import { facultiesQueryOptions } from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/facultiesQueryOptions";
import ChangeEducationProgramForm
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/ChangeEducationProgramForm";
import DeleteEducationProgramDialog
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/DeleteEducationProgramDialog";
import {
    educationProgramQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/[educationProgramId]/_components/educationProgramQueryOptions";

const Page = () => {
    const { institutionId, educationProgramId } = useParams() as { institutionId: string; educationProgramId: string };
    const [lang] = useLang();
    const router = useRouter();

    const { data: program, status } = useQuery(educationProgramQueryOptions(educationProgramId));
    const { data: faculties } = useQuery(facultiesQueryOptions(institutionId));

    if (status === "pending") return <ProgramDetailSkeleton />;

    if (status === "error") return (
        <div className="container mx-auto py-16 text-center">
            <BookText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
                {lang === "kk" ? "Бағдарлама табылмады" : lang === "ru" ? "Программа не найдена" : "Program Not Found"}
            </h2>
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {lang === "kk" ? "Артқа" : lang === "ru" ? "Назад" : "Back"}
            </Button>
        </div>
    );

    const studyFormMeta: Record<StudyForm, { labels: Record<string, string>; color: string }> = {
        FullTime:  { labels: { kk: "Күндізгі",    ru: "Очная",         en: "Full-time" }, color: "green"  },
        PartTime:  { labels: { kk: "Сырттай",     ru: "Заочная",       en: "Part-time" }, color: "blue"   },
        Evening:   { labels: { kk: "Кешкі",       ru: "Вечерняя",      en: "Evening"   }, color: "purple" },
        Distance:  { labels: { kk: "Қашықтықтан", ru: "Дистанционная", en: "Distance"  }, color: "orange" },
    };

    const langLabels: Record<number, { flag: string; label: string }> = {
        // @ts-ignore
        "Kazakh": { flag: "🇰🇿", label: "Қазақша" },
        "Russian": { flag: "🇷🇺", label: "Русский" },
        "English": { flag: "🇬🇧", label: "English" },
    };

    const studyForm = studyFormMeta[program.studyForm];
    const generalStats = program.educationGroup?.grantCompetitionStatistics?.find(s => s.competitionType === GrantCompetitionType.General);
    const ruralStats = program.educationGroup?.grantCompetitionStatistics?.find(s => s.competitionType === GrantCompetitionType.Rural);

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            {/* Back */}
            <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    {lang === "kk" ? "Барлық бағдарламалар" : lang === "ru" ? "Все программы" : "All Programs"}
                </Button>
            </div>

            {/* Hero */}
            <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="p-4 bg-primary/15 rounded-2xl shrink-0">
                            <BookText className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-3xl font-bold">
                                    {program.name[lang as keyof typeof program.name] || program.name.ru}
                                </h1>
                                <Badge variant="outline" className="font-mono text-sm">{program.code}</Badge>
                            </div>
                            {program.faculty && (
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <Building2 className="w-4 h-4" />
                                    <span className="text-sm">
                                        {program.faculty.name[lang as keyof typeof program.faculty.name] || program.faculty.name.ru}
                                    </span>
                                </div>
                            )}
                            {program.description && (
                                <p className="mt-3 text-muted-foreground max-w-xl text-sm leading-relaxed">
                                    {program.description[lang as keyof typeof program.description] || program.description.ru}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-col">

                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<Clock className="w-5 h-5 text-green-500" />}
                    label={lang === "kk" ? "Оқу мерзімі" : lang === "ru" ? "Срок обучения" : "Duration"}
                    value={`${program.durationYears} ${lang === "kk" ? "жыл" : lang === "ru" ? "лет" : "yrs"}`}
                    bg="from-green-500/10 to-emerald-500/5"
                />
                <StatCard
                    icon={<Star className="w-5 h-5 text-yellow-500" />}
                    label={lang === "kk" ? "Мин. ҰБТ" : lang === "ru" ? "Мин. балл" : "Min. UNT"}
                    value={String(program.minimumUntScore)}
                    bg="from-yellow-500/10 to-amber-500/5"
                />
                <StatCard
                    icon={<GraduationCap className="w-5 h-5 text-blue-500" />}
                    label={lang === "kk" ? "Топ" : lang === "ru" ? "Группа" : "Group"}
                    value={
                        <div className="flex flex-col">
                            <span className="text-xs font-mono text-muted-foreground font-normal">
                                {program.educationGroup?.nationalCode || "—"}
                            </span>
                            <span className="text-sm font-bold leading-tight">
                                {program.educationGroup?.name[lang as keyof typeof program.educationGroup.name]
                                    || program.educationGroup?.name.ru
                                    || "—"}
                            </span>
                        </div>
                    }
                    bg="from-blue-500/10 to-indigo-500/5"
                />
                <StatCard
                    icon={<BookOpen className="w-5 h-5 text-purple-500" />}
                    label={lang === "kk" ? "Оқу түрі" : lang === "ru" ? "Форма" : "Form"}
                    value={studyForm?.labels[lang] ?? studyForm?.labels.en ?? "—"}
                    bg="from-purple-500/10 to-violet-500/5"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Languages */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Languages className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold">
                                {lang === "kk" ? "Оқыту тілдері" : lang === "ru" ? "Языки обучения" : "Languages"}
                            </h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {program.languages?.map((code) => {
                                const l = langLabels[code];
                                return l ? (
                                    <Badge key={code} variant="secondary" className="text-sm gap-1.5 px-3 py-1.5">
                                        {l.flag} {l.label}
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </CardContent>
                </Card>
                {/* UNT Subjects */}
                {/* @ts-ignore */}
                {program.educationGroup?.untSubjectsPairs?.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary" />
                                <h2 className="font-semibold">
                                    {lang === "kk" ? "ҰБТ пәндері" : lang === "ru" ? "Предметы ЕНТ" : "UNT Subjects"}
                                </h2>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* @ts-ignore */}
                            {program.educationGroup.untSubjectsPairs.map((pair, i) => (
                                <div key={pair.id} className="flex items-center gap-2 text-sm">
                                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                                    <Badge variant="outline" className="text-xs">
                                        {pair.firstSubject.name[lang as keyof typeof pair.firstSubject.name] || pair.firstSubject.name.ru}
                                    </Badge>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                                    <Badge variant="outline" className="text-xs">
                                        {pair.secondSubject.name[lang as keyof typeof pair.secondSubject.name] || pair.secondSubject.name.ru}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Work Places + Practise Bases */}
            {(program.workPlaces?.ru || program.practiseBases?.ru) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {program.workPlaces?.ru && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    <h2 className="font-semibold">
                                        {lang === "kk" ? "Жұмыс орындары" : lang === "ru" ? "Места работы" : "Work Places"}
                                    </h2>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {program.workPlaces[lang as keyof typeof program.workPlaces] || program.workPlaces.ru}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    {program.practiseBases?.ru && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <h2 className="font-semibold">
                                        {lang === "kk" ? "Тәжірибе базалары" : lang === "ru" ? "Базы практик" : "Practise Bases"}
                                    </h2>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {program.practiseBases[lang as keyof typeof program.practiseBases] || program.practiseBases.ru}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Grant Competition Statistics */}
            {(generalStats || ruralStats) && (
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold">
                                {lang === "kk" ? "Грант конкурсы статистикасы" : lang === "ru" ? "Статистика грантового конкурса" : "Grant Competition Statistics"}
                            </h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { stats: generalStats, label: { kk: "Жалпы конкурс", ru: "Общий конкурс", en: "General" } },
                                { stats: ruralStats,   label: { kk: "Ауыл конкурсы", ru: "Сельский конкурс", en: "Rural" } },
                            ].map(({ stats, label }) => stats && (
                                <div key={stats.id}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium">{label[lang as keyof typeof label]}</span>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>
                                                {lang === "kk" ? "Мин. балл:" : lang === "ru" ? "Мин. балл:" : "Min score:"}
                                                {" "}<strong className="text-foreground">{stats.minScore}</strong>
                                            </span>
                                            <span>
                                                {lang === "kk" ? "Грант:" : lang === "ru" ? "Грантов:" : "Grants:"}
                                                {" "}<strong className="text-foreground">{stats.totalGrants}</strong>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                        {stats
                                            .frequencyRecords
                                            .slice()
                                            .sort((a, b) => b.score - a.score)
                                            .map((record) => {
                                                const pct = Math.round((record.frequency / stats.totalGrants) * 100);
                                                return (
                                                    <div key={record.score} className="flex items-center gap-3">
                                                        <span className="text-xs font-mono w-8 text-right shrink-0">{record.score}</span>
                                                        <div className="flex-1 bg-accent rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary/60 rounded-full transition-all"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground w-6 shrink-0">{record.frequency}</span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Prices */}
            {program.prices?.length > 0 && (
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold">
                                {lang === "kk" ? "Оқу ақысы" : lang === "ru" ? "Стоимость обучения" : "Tuition Fees"}
                            </h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {program.prices.map((price, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5">
                                    <span className="text-sm text-muted-foreground">{price.year}</span>
                                    <span className="text-sm font-semibold">
                                        {price.amount.toLocaleString()} ₸
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Disciplines */}
            {program.disciplines?.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold">
                                {lang === "kk" ? "Пәндер" : lang === "ru" ? "Дисциплины" : "Disciplines"}
                                <Badge variant="secondary" className="ml-2 text-xs">{program.disciplines.length}</Badge>
                            </h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {program.disciplines.map((d, i) => (
                                <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {d.name[lang as keyof typeof d.name] || d.name.ru}
                                        </p>
                                        {(d.description?.ru) && (
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                {d.description[lang as keyof typeof d.description] || d.description.ru}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant="outline" className="text-xs">{d.credits} cr</Badge>
                                        <div className="flex gap-1">
                                            {d.semesters.map(s => (
                                                <Badge key={s} variant="secondary" className="text-xs px-1.5">
                                                    {lang === "kk" ? `${s}с` : lang === "ru" ? `${s}с` : `S${s}`}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, bg }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;  // ← ReactNode instead of string
    bg: string
}) => (
    <Card className={`bg-gradient-to-br ${bg} border-0`}>
        <CardContent className="p-5">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-xs text-muted-foreground font-medium">{label}</span>
                </div>
                <div className="text-xl font-bold">{value}</div>
            </div>
        </CardContent>
    </Card>
);

const ProgramDetailSkeleton = () => (
    <div className="container mx-auto py-8 max-w-5xl">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-48 w-full rounded-2xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl mb-6" />
        <Skeleton className="h-48 rounded-xl" />
    </div>
);

export default Page;