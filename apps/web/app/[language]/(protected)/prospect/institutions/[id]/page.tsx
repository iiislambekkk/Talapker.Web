"use client"

import React from 'react';
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
import { Users, DollarSign, Home, Shield, Globe, MapPin, GraduationCap, Clock, BookOpen, Bell, BellOff, ExternalLink, Sparkles } from "lucide-react";
import { queryOptions } from "@tanstack/react-query";
import {
    educationProgramsQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/educationProgramsQueryOptions";

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
    },
};

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
    const id = params.id as string;
    const [ lang ] = useLang();
    const labels = t[lang as keyof typeof t] ?? t.ru;
    const { data: session } = useSession();
    const userId = session?.user?.sub ?? "";
    const queryClient = useQueryClient();

    const { data: institution, status: institutionStatus } = useQuery(institutionForAdminQueryOptions(id));
    const { data: programs, status: programsStatus } = useQuery(educationProgramsQueryOptions(id));
    const { data: subscriptions } = useQuery(subscribedInstitutionsQueryOptions(userId));

    const isSubscribed = subscriptions?.some(s => s.id === id) ?? false;

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

    const isPending = subscribeMutation.isPending || unsubscribeMutation.isPending;

    if (institutionStatus === "pending") return <InstitutionPageSkeleton />;
    if (institutionStatus === "error") return <p className="text-destructive">Ошибка загрузки</p>;

    return (
        <div className="flex flex-col gap-8">
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
                        <Button
                            variant={isSubscribed ? "outline" : "default"}
                            onClick={() => isSubscribed ? unsubscribeMutation.mutate() : subscribeMutation.mutate()}
                            disabled={isPending || !userId}
                            className="shrink-0"
                        >
                            {isSubscribed
                                ? <><BellOff className="w-4 h-4 mr-2" />{labels.unsubscribe}</>
                                : <><Bell className="w-4 h-4 mr-2" />{labels.subscribe}</>
                            }
                        </Button>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">{institution.description[lang]}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{institution.address}</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={<Users className="w-5 h-5" />} label={labels.students} value={institution.studentsCount.toLocaleString()} />
                <StatCard icon={<DollarSign className="w-5 h-5" />} label={labels.minCost} value={institution.minCostPerYear.toLocaleString() + " ₸"} />
                <StatCard icon={<Home className="w-5 h-5" />} label={labels.housing} value={institution.hasHousing ? labels.yes : labels.no} />
                <StatCard icon={<Shield className="w-5 h-5" />} label={labels.military} value={institution.hasMilitaryDepartment ? labels.yes : labels.no} />
            </div>

            {/* Education Programs */}
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">{labels.programs}</h2>

                {programsStatus === "pending" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))}
                    </div>
                )}

                {programsStatus === "success" && programs.length === 0 && (
                    <p className="text-muted-foreground">{labels.noPrograms}</p>
                )}

                {programsStatus === "success" && programs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {programs.map(program => (
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
                                            onClick={() => router.push(`/${lang}/prospect/institutions/${id}/education-program/${program.id}`)}
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            {labels.details}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="flex-1"
                                            onClick={() => router.push(`/${lang}/prospect/ai`)}
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