"use client"
import React from 'react';
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {useLang} from "@/hooks/useLang";
import {Badge} from "@workspace/ui/components/badge";
import {Skeleton} from "@workspace/ui/components/skeleton";
import {Card, CardContent} from "@workspace/ui/components/card";
import { Building2, BookOpen, GraduationCap, Layers, ArrowRight } from 'lucide-react';
import {facultiesQueryOptions} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/facultiesQueryOptions";
import {FacultyDto} from "@/Data/models/Faculty";
import {Button} from "@workspace/ui/components/button";
import CreateFacultyForm from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/CreateFacultyFormProps";
import ChangeFacultyForm from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/ChangeFacultyForm";
import {Avatar, AvatarFallback, AvatarImage} from "@workspace/ui/components/avatar";
import {generateS3UrlFromKey} from "@/lib/generateS3UrlFromKey";
import {logger} from "@/lib/logger";

type Lang = "ru" | "kk" | "en";
type BadgeVariant = "blue" | "purple" | "teal" | "orange" | "yellow" | "pink" | "red" | "indigo" | "green";

const t = {
    title:            { ru: "Факультеты",                                     kk: "Факультеттер",                                   en: "Faculties"                                       },
    subtitle:         { ru: "Управление факультетами и образовательными программами", kk: "Факультеттер мен білім бағдарламаларын басқару", en: "Manage faculties and their educational programs"  },
    totalFaculties:   { ru: "Всего факультетов",                              kk: "Барлық факультеттер",                            en: "Total Faculties"                                 },
    totalPrograms:    { ru: "Всего программ",                                 kk: "Барлық бағдарламалар",                           en: "Total Programs"                                  },
    noFaculties:      { ru: "Факультетов пока нет",                           kk: "Факультеттер әлі жоқ",                           en: "No Faculties Yet"                                },
    noFacultiesDesc:  { ru: "Начните с создания первого факультета.",         kk: "Бірінші факультетті жасаудан бастаңыз.",         en: "Start by creating your first faculty."           },
    programs:         { ru: "Программы",                                      kk: "Бағдарламалар",                                  en: "Programs"                                        },
    programsCount:    { ru: (n: number) => `${n} программ`,                  kk: (n: number) => `${n} бағдарлама`,                 en: (n: number) => `${n} programs`                    },
    active:           { ru: "Активен",                                        kk: "Белсенді",                                       en: "Active"                                          },
    noPrograms:       { ru: "Программ пока нет",                              kk: "Бағдарламалар әлі жоқ",                          en: "No programs yet"                                 },
    more:             { ru: (n: number) => `+${n} ещё`,                      kk: (n: number) => `+${n} тағы`,                      en: (n: number) => `+${n} more`                       },
    viewDetails:      { ru: "Подробнее",                                      kk: "Толығырақ",                                      en: "View Details"                                    },
} as const;

interface ColorScheme {
    bg: string;
    avatar: string;
    badge: BadgeVariant;
}

const COLOR_MAP: Record<string, ColorScheme> = {
    blue:   { bg: "from-blue-500/10 to-indigo-500/10",    avatar: "from-blue-500/20 to-indigo-500/20",    badge: "blue"   },
    purple: { bg: "from-purple-500/10 to-pink-500/10",    avatar: "from-purple-500/20 to-pink-500/20",    badge: "purple" },
    teal:   { bg: "from-emerald-500/10 to-teal-500/10",   avatar: "from-emerald-500/20 to-teal-500/20",   badge: "teal"   },
    orange: { bg: "from-orange-500/10 to-red-500/10",     avatar: "from-orange-500/20 to-red-500/20",     badge: "orange" },
    yellow: { bg: "from-yellow-500/10 to-amber-500/10",   avatar: "from-yellow-500/20 to-amber-500/20",   badge: "yellow" },
    pink:   { bg: "from-pink-500/10 to-rose-500/10",      avatar: "from-pink-500/20 to-rose-500/20",      badge: "pink"   },
    red:    { bg: "from-red-500/10 to-rose-500/10",       avatar: "from-red-500/20 to-rose-500/20",       badge: "red"    },
    indigo: { bg: "from-indigo-500/10 to-violet-500/10",  avatar: "from-indigo-500/20 to-violet-500/20",  badge: "indigo" },
    green:  { bg: "from-green-500/10 to-emerald-500/10",  avatar: "from-green-500/20 to-emerald-500/20",  badge: "green"  },
};

const DEFAULT_COLOR = COLOR_MAP.blue;

const Page = () => {
    const {institutionId} = useParams() as {institutionId: string};
    const [lang] = useLang();
    const l: Lang = (lang as Lang) in t.title ? (lang as Lang) : "en";
    const { data: faculties, status } = useQuery(facultiesQueryOptions(institutionId));

    logger.log("[Faculties] data:", faculties);

    if (status === "success") {
        const totalPrograms = faculties.reduce((acc, f) => acc + (f.educationPrograms?.length || 0), 0);

        return (
            <div className="container mx-auto py-8 space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground">{t.title[l]}</h1>
                        <p className="text-muted-foreground mt-1">{t.subtitle[l]}</p>
                    </div>
                    <CreateFacultyForm institutionId={institutionId} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                                <Building2 className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t.totalFaculties[l]}</p>
                                <p className="text-3xl font-bold">{faculties.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                <BookOpen className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t.totalPrograms[l]}</p>
                                <p className="text-3xl font-bold">{totalPrograms}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {faculties.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="p-16 flex flex-col items-center justify-center text-center gap-4">
                            <div className="p-4 bg-muted rounded-2xl">
                                <Building2 className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{t.noFaculties[l]}</h3>
                                <p className="text-muted-foreground mt-1">{t.noFacultiesDesc[l]}</p>
                            </div>
                            <CreateFacultyForm institutionId={institutionId} />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {faculties.map((faculty) => (
                            <FacultyCard
                                key={faculty.id}
                                faculty={faculty}
                                lang={lang}
                                l={l}
                                colorScheme={COLOR_MAP[faculty.color] ?? DEFAULT_COLOR}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return <FacultiesPageSkeleton />;
};

const FacultyCard = ({ faculty, lang, l, colorScheme }: { faculty: FacultyDto; lang: string; l: Lang; colorScheme: ColorScheme }) => {
    const {institutionId} = useParams() as {institutionId: string};
    const programCount = faculty.educationPrograms?.length || 0;
    const name = faculty.name[lang as keyof typeof faculty.name] || faculty.name.ru;

    return (
        <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className={`bg-gradient-to-br ${colorScheme.bg} px-6 pt-6 pb-4 flex items-center gap-4`}>
                <div className={`shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${colorScheme.avatar} flex items-center justify-center shadow-sm overflow-hidden`}>
                    <Avatar className="w-14 h-14">
                        <AvatarImage src={generateS3UrlFromKey(faculty.logoUrl)} alt={name} />
                        <AvatarFallback className={`bg-gradient-to-br ${colorScheme.avatar} text-xl font-bold`}>
                            {name?.[0] ?? "F"}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground leading-tight truncate">{name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant={colorScheme.badge} className="gap-1 text-xs">
                            <BookOpen className="w-3 h-3" />
                            {t.programsCount[l](programCount)}
                        </Badge>
                        <Badge variant="green" className="gap-1 text-xs">
                            <GraduationCap className="w-3 h-3" />
                            {t.active[l]}
                        </Badge>
                    </div>
                </div>
            </div>

            <CardContent className="p-6 flex flex-col flex-1">
                {programCount > 0 ? (
                    <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.programs[l]}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {faculty.educationPrograms?.slice(0, 3).map((program) => (
                                <Badge key={program.id} variant="secondary" className="text-xs">
                                    {program.name[lang as keyof typeof program.name] || program.name.ru}
                                </Badge>
                            ))}
                            {programCount > 3 && (
                                <Badge variant="outline" className="text-xs">{t.more[l](programCount - 3)}</Badge>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center py-4">
                        <p className="text-xs text-muted-foreground">{t.noPrograms[l]}</p>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <ChangeFacultyForm faculty={faculty} institutionId={institutionId} />
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                        {t.viewDetails[l]}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const FacultiesPageSkeleton = () => (
    <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-72" />
            </div>
            <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 6}).map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-24 w-full rounded-t-xl" />
                    <CardContent className="p-6 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                        <div className="flex justify-between pt-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-28" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

export default Page;