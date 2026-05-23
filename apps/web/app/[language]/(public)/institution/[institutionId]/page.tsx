"use client"

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { institutionForAdminQueryOptions } from "@/lib/tanstackQuery/options/institutionForAdminQueryOptions";
import { generateS3UrlFromKey } from "@/lib/generateS3UrlFromKey";
import { useLang } from "@/hooks/useLang";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { toast } from "sonner";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { Users, Home, Shield, Globe, GraduationCap, Clock, BookOpen, ExternalLink, Sparkles, MessageCircle, X, Filter } from "lucide-react";
import { queryOptions } from "@tanstack/react-query";
import { educationProgramsQueryOptions } from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/educationProgramsQueryOptions";
import InstitutionDescriptionView from "@/components/institutions/InstitutionDescriptionView";
import {useIsMobile} from "@/hooks/use-mobile";

const t = {
    ru: {
        students: "Студентов",
        minCost: "Мин. стоимость/год",
        housing: "Общежитие",
        military: "Военная кафедра",
        yes: "Есть",
        no: "Нет",
        programs: "Образовательные программы",
        minScore: "Мин. балл ЕНТ",
        duration: "Срок обучения",
        years: "лет",
        languages: "Языки",
        noPrograms: "Программы не найдены",
        subscribe: "Подписаться",
        unsubscribe: "Отписаться",
        details: "Подробнее",
        askAi: "Спросить AI",
        subscribeSuccess: "Вы подписались на университет",
        unsubscribeSuccess: "Вы отписались от университета",
        error: "Что-то пошло не так",
        chatWithAi: "Чат с AI",
        allFaculties: "Все факультеты",
        askAboutProgram: (code: string, name: string) =>
            `Расскажи подробнее про специальность ${code} — ${name}: вступительные баллы, стоимость, карьерные перспективы и чем она отличается от похожих.`,
    },
    kk: {
        students: "Студенттер",
        minCost: "Мин. құны/жыл",
        housing: "Жатақхана",
        military: "Әскери кафедра",
        yes: "Бар",
        no: "Жоқ",
        programs: "Білім беру бағдарламалары",
        minScore: "ҰБТ мин. балл",
        duration: "Оқу мерзімі",
        years: "жыл",
        languages: "Тілдер",
        noPrograms: "Бағдарламалар табылмады",
        subscribe: "Жазылу",
        unsubscribe: "Жазылымнан шығу",
        details: "Толығырақ",
        askAi: "AI-дан сұра",
        subscribeSuccess: "Университетке жазылдыңыз",
        unsubscribeSuccess: "Жазылымнан шықтыңыз",
        error: "Бірдеңе дұрыс болмады",
        chatWithAi: "AI чат",
        allFaculties: "Барлық факультеттер",
        askAboutProgram: (code: string, name: string) =>
            `${code} — ${name} мамандығы туралы толығырақ айт: кіру баллдары, құны, мансаптық мүмкіндіктер.`,
    },
    en: {
        students: "Students",
        minCost: "Min cost/year",
        housing: "Housing",
        military: "Military dept.",
        yes: "Available",
        no: "None",
        programs: "Education Programs",
        minScore: "Min UNT score",
        duration: "Duration",
        years: "years",
        languages: "Languages",
        noPrograms: "No programs found",
        subscribe: "Subscribe",
        unsubscribe: "Unsubscribe",
        details: "Details",
        askAi: "Ask AI",
        subscribeSuccess: "Subscribed to university",
        unsubscribeSuccess: "Unsubscribed from university",
        error: "Something went wrong",
        chatWithAi: "Chat with AI",
        allFaculties: "All faculties",
        askAboutProgram: (code: string, name: string) =>
            `Tell me more about the ${code} — ${name} program: admission scores, tuition, career prospects and how it differs from similar ones.`,
    },
} as const;

const subscribedInstitutionsQueryOptions = (userId: string) => queryOptions({
    queryKey: ["prospect", "subscriptions", userId],
    queryFn: async () => {
        const api = createApi();
        const res = await api.get(`/api/prospects/subscriptions?userId=${userId}`);
        return res.data as { id: string }[];
    },
    enabled: !!userId,
});

const ProspectInstitutionPage = () => {
    const params = useParams();
    const router = useRouter();

    // @ts-ignore
    const id = params.institutionId as string;
    const [lang] = useLang();
    const labels = t[lang as keyof typeof t] ?? t.ru;
    const { data: session } = useSession();
    const userId = session?.user?.sub ?? "";
    const queryClient = useQueryClient();

    const { data: institution, status: institutionStatus } = useQuery(institutionForAdminQueryOptions(id));
    const { data: programs, status: programsStatus } = useQuery(educationProgramsQueryOptions(id));
    const { data: subscriptions } = useQuery(subscribedInstitutionsQueryOptions(userId));

    const isSubscribed = subscriptions?.some(s => s.id === id) ?? false;

    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [widgetQuestion, setWidgetQuestion] = useState<string>("");
    const [selectedFacultyId, setSelectedFacultyId] = useState<string>("all");
    const widgetFrameRef = useRef<HTMLIFrameElement>(null);
    const widgetPortalRef = useRef<HTMLDivElement>(null);

    // Получаем уникальные факультеты из программ
    const faculties = useMemo(() => {
        if (!programs) return [];
        const facultyMap = new Map();
        programs.forEach(program => {
            if (program.faculty && program.faculty.id) {
                if (!facultyMap.has(program.faculty.id)) {
                    facultyMap.set(program.faculty.id, {
                        id: program.faculty.id,
                        name: program.faculty.name,
                    });
                }
            }
        });
        return Array.from(facultyMap.values());
    }, [programs]);

    // Фильтруем программы по выбранному факультету
    const filteredPrograms = useMemo(() => {
        if (!programs) return [];
        if (selectedFacultyId === "all") return programs;
        return programs.filter(program => program.faculty?.id === selectedFacultyId);
    }, [programs, selectedFacultyId]);

    const buildWidgetUrl = useCallback((question?: string) => {
        if (typeof window === 'undefined') return '';
        const url = new URL(`https://frontend.mektep32.org/${lang}/widget-chat`);
        url.searchParams.set('theme', 'light');
        url.searchParams.set('institutionId', id);
        url.searchParams.set('lang', lang);
        if (question) url.searchParams.set('redirectedQuestion', encodeURIComponent(question));
        return url.toString();
    }, [lang, id]);

    const openWidget = useCallback((question?: string) => {
        setWidgetQuestion(question ?? "");
        setIsWidgetOpen(true);
        document.body.style.overflow = 'hidden';
    }, []);

    const closeWidget = useCallback(() => {
        setIsWidgetOpen(false);
        document.body.style.overflow = '';
    }, []);

    const toggleWidget = useCallback(() => {
        if (isWidgetOpen) closeWidget();
        else openWidget();
    }, [isWidgetOpen, openWidget, closeWidget]);

    const isMobile = useIsMobile()

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data?.type === 'WIDGET_CLOSE') closeWidget();
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [closeWidget]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isWidgetOpen) closeWidget();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isWidgetOpen, closeWidget]);

    const subscribeMutation = useMutation({
        mutationFn: async () => {
            const api = createApi();
            await api.post(`/api/prospects/subscriptions/${id}`, userId, {
                headers: { "Content-Type": "application/json" },
            });
        },
        onSuccess: () => {
            toast.success(labels.subscribeSuccess);
            queryClient.invalidateQueries({ queryKey: ["prospect", "subscriptions", userId] });
        },
        onError: () => toast.error(labels.error),
    });

    const unsubscribeMutation = useMutation({
        mutationFn: async () => {
            const api = createApi();
            await api.delete(`/api/prospects/subscriptions/${id}`, {
                data: userId,
                headers: { "Content-Type": "application/json" },
            });
        },
        onSuccess: () => {
            toast.success(labels.unsubscribeSuccess);
            queryClient.invalidateQueries({ queryKey: ["prospect", "subscriptions", userId] });
        },
        onError: () => toast.error(labels.error),
    });

    const widgetUrl = isWidgetOpen ? buildWidgetUrl(widgetQuestion) : buildWidgetUrl();

    if (institutionStatus === "pending") return <InstitutionPageSkeleton />;
    if (institutionStatus === "error") return <p className="text-destructive">Ошибка загрузки</p>;

    return (
        <>
            <div className="flex flex-col gap-8 overflow-hidden">
                {/* Hero */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <ImageWithFallback
                        src={generateS3UrlFromKey(institution.logoKey)}
                        alt={institution.name[lang] ?? ""}
                        width={120}
                        height={120}
                        imageClassName="rounded-2xl aspect-square object-cover"
                        skeletonClassName="aspect-square w-[120px] rounded-2xl"
                    />
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold">{institution.name[lang]}</h1>
                                <Badge>{institution.type}</Badge>
                                {institution.nationalCode && (
                                    <Badge variant="outline">#{institution.nationalCode}</Badge>
                                )}
                            </div>
                        </div>

                        <div className="text-muted-foreground max-w-2xl">
                            <InstitutionDescriptionView description={institution.description[lang]} />
                        </div>

                        {institution.webSiteUrl && (
                            <a
                                href={institution.webSiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-primary hover:underline w-fit"
                            >
                                <Globe className="w-4 h-4" />
                                {institution.webSiteUrl}
                            </a>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard icon={<Users className="w-5 h-5" />} label={labels.students} value={institution.studentsCount.toLocaleString()} />
                    <StatCard icon={<Home className="w-5 h-5" />} label={labels.housing} value="Бар" />
                    <StatCard icon={<Shield className="w-5 h-5" />} label={labels.military} value="Бар" />
                </div>

                {/* Education Programs with Faculty Filter */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-xl font-semibold">{labels.programs}</h2>

                        {/* Faculty Filter */}
                        {faculties.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <select
                                    value={selectedFacultyId}
                                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                                    className="text-sm border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="all">{labels.allFaculties}</option>
                                    {faculties.map(faculty => (
                                        <option key={faculty.id} value={faculty.id}>
                                            {faculty.name[lang] ?? faculty.name.ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {programsStatus === "pending" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-40 rounded-xl" />
                            ))}
                        </div>
                    )}

                    {programsStatus === "success" && filteredPrograms.length === 0 && (
                        <p className="text-muted-foreground">{labels.noPrograms}</p>
                    )}

                    {programsStatus === "success" && filteredPrograms.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPrograms.map(program => (
                                <Card key={program.id} className="flex flex-col gap-0 py-0">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-base line-clamp-2">
                                                {program.name[lang]}
                                            </CardTitle>
                                            <Badge variant="outline" className="shrink-0">{program.code}</Badge>
                                        </div>
                                        {program.faculty && (
                                            <p className="text-xs text-muted-foreground">{program.faculty.name[lang]}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 flex flex-col gap-3">
                                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <GraduationCap className="w-4 h-4" />
                                                {labels.minScore}: {program.minimumUntScore}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {program.durationYears} {labels.years}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{labels.languages}: {program.languages.join(", ")}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {program.prices.map((price, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {price.year}г — {price.amount.toLocaleString()}₸
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => router.push(`/${lang}/institution/${id}/educationProgram/${program.id}`)}
                                            >
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                {labels.details}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1"
                                                onClick={() => openWidget(labels.askAboutProgram(program.code, program.name[lang] ?? program.name.ru))}
                                            >
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                {labels.askAi}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* FAB — кнопка чата. На мобилах X скрыт т.к. закрытие через свайп/backdrop */}
            <button
                onClick={toggleWidget}
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600
                 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 
                 flex items-center justify-center text-white z-50 border-0 cursor-pointer
                 ${isMobile && isWidgetOpen && "hidden"}
                 `}
                aria-label={labels.chatWithAi}
            >
                {isWidgetOpen
                    ? <X className="w-6 h-6 hidden sm:block" />
                    : <MessageCircle className="w-6 h-6" />
                }
            </button>

            {/* Widget Portal */}
            <div
                ref={widgetPortalRef}
                className={`fixed inset-0 z-40 ${isWidgetOpen ? 'flex' : 'hidden'} items-center justify-center`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={closeWidget}
                />

                {/* Iframe — ключ меняется при смене вопроса, чтобы iframe перезагрузился */}
                <iframe
                    key={widgetUrl}
                    ref={widgetFrameRef}
                    src={widgetUrl}
                    className={`
                        relative z-10
                        w-[680px] h-[780px]
                        max-sm:w-full max-sm:h-full
                        border-0 rounded-2xl max-sm:rounded-none
                        shadow-2xl
                        transition-all duration-200 ease-out
                        ${isWidgetOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-2'
                    }
                    `}
                    title="AI Chat Widget"
                />
            </div>
        </>
    );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Card className="py-4">
        <CardContent className="flex flex-col items-center gap-1 text-center px-4">
            <div className="text-muted-foreground">{icon}</div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold text-sm">{value}</p>
        </CardContent>
    </Card>
);

const InstitutionPageSkeleton = () => (
    <div className="flex flex-col gap-8">
        <div className="flex gap-6">
            <Skeleton className="w-[120px] h-[120px] rounded-2xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full max-w-lg" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
    </div>
);

export default ProspectInstitutionPage;