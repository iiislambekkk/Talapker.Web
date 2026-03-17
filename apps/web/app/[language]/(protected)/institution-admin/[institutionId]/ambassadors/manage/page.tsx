"use client"
import React from 'react';
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/hooks/useLang";
import { generateS3UrlFromKey } from "@/lib/generateS3UrlFromKey";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    MessageCircle, Star, Clock, GraduationCap,
    Calendar, Languages, Heart, CheckCircle, XCircle, Users,
} from 'lucide-react';
import { ambassadorsQueryOptions } from "@/lib/tanstackQuery/options/ambassadorsQueryOptions";

type Lang = "ru" | "kk" | "en";

const t = {
    title:          { ru: "Амбассадоры кампуса",      kk: "Кампус амбассадорлары",         en: "Campus Ambassadors"          },
    subtitle:       { ru: "Студенты, готовые ответить на ваши вопросы", kk: "Сұрақтарыңызға жауап беруге дайын студенттер", en: "Student representatives ready to answer your questions" },
    totalAmbassadors: { ru: "Всего амбассадоров",     kk: "Барлық амбассадорлар",          en: "Total Ambassadors"           },
    totalChats:     { ru: "Всего чатов",              kk: "Барлық чаттар",                 en: "Total Chats"                 },
    activeAmbassadors: { ru: "Активные амбассадоры",  kk: "Белсенді амбассадорлар",        en: "Active Ambassadors"          },
    major:          { ru: "Специальность",            kk: "Мамандық",                      en: "Major"                      },
    active:         { ru: "Активен",                  kk: "Белсенді",                      en: "Active"                     },
    boarding:       { ru: "Онбординг",                kk: "Онбординг",                     en: "Onboarding"                  },
    year:           { ru: "Курс",                     kk: "Курс",                          en: "Year"                       },
    languages:      { ru: "Языки",                    kk: "Тілдер",                        en: "Languages"                  },
    interests:      { ru: "Интересы",                 kk: "Қызығушылықтар",               en: "Interests"                  },
    joined:         { ru: "Вступил",                  kk: "Қосылды",                       en: "Joined"                     },
    noAmbassadors:  { ru: "Пока нет амбассадоров",    kk: "Амбассадорлар әлі жоқ",         en: "No Ambassadors Yet"          },
    noAmbassadorsHint: { ru: "Начните с приглашения студентов.", kk: "Студенттерді шақырудан бастаңыз.", en: "Start by inviting students to become ambassadors." },
} as const;

const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const Page = () => {
    const { institutionId } = useParams() as { institutionId: string };
    const [rawLang] = useLang();
    const l: Lang = (["ru", "kk", "en"] as Lang[]).includes(rawLang as Lang) ? (rawLang as Lang) : "en";

    const { data: ambassadors, status } = useQuery(ambassadorsQueryOptions(institutionId));

    if (status === "success") {
        return (
            <div className="container mx-auto py-8 space-y-10">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{t.title[l]}</h1>
                        <p className="text-muted-foreground mt-1">{t.subtitle[l]}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <Users className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t.totalAmbassadors[l]}</p>
                                    <p className="text-2xl font-bold">{ambassadors.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <MessageCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t.totalChats[l]}</p>
                                    <p className="text-2xl font-bold">
                                        {ambassadors.reduce((acc, a) => acc + a.totalChats, 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-500/20 rounded-xl">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t.activeAmbassadors[l]}</p>
                                    <p className="text-2xl font-bold">
                                        {ambassadors.reduce((acc, a) => acc + (a.isActive ? 1 : 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ambassador cards */}
                {ambassadors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ambassadors.map((ambassador) => (
                            <Card key={ambassador.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <CardContent className="p-6">
                                    {/* Avatar + name row */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="w-14 h-14 border-2 border-border">
                                                <AvatarImage
                                                    src={generateS3UrlFromKey(ambassador.avatarUrl)}
                                                    alt={ambassador.firstName}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-semibold">
                                                    {getInitials(ambassador.firstName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${ambassador.isActive ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{ambassador.email}</h3>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {t.major[l]}: {ambassador.educationalProgramName}
                                            </p>
                                        </div>
                                    </div>

                                    {ambassador.tagline && (
                                        <p className="text-sm italic text-muted-foreground mb-4 border-l-2 border-border pl-3">
                                            {ambassador.tagline}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-accent/50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <GraduationCap className="w-4 h-4 text-primary" />
                                                <span>{t.year[l]} {ambassador.studyYear}</span>
                                            </div>
                                        </div>
                                        <div className="bg-accent/50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                <span>{ambassador.rating}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {ambassador.languages?.length > 0 && (
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Languages className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="text-xs font-medium text-muted-foreground">{t.languages[l]}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {ambassador.languages.map((lang, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">{lang}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {ambassador.interests?.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Heart className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="text-xs font-medium text-muted-foreground">{t.interests[l]}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {ambassador.interests.map((interest, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">{interest}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {t.joined[l]} {new Date(ambassador.dateJoined).toLocaleDateString()}
                                        </div>
                                        {ambassador.lastActiveAt && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {new Date(ambassador.lastActiveAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t.noAmbassadors[l]}</h3>
                            <p className="text-muted-foreground">{t.noAmbassadorsHint[l]}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return <AmbassadorsPageSkeleton />;
};

const AmbassadorsPageSkeleton = () => (
    <div className="container mx-auto py-8 space-y-10">
        <div className="flex justify-between items-start">
            <div><Skeleton className="h-9 w-64 mb-2" /><Skeleton className="h-5 w-80" /></div>
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>)}
        </div>
        <Card>
            <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-32 mb-4" />
                {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32" /></div>
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
                <Card key={i}><CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
                    <Skeleton className="h-3 w-full mb-1" /><Skeleton className="h-3 w-3/4" />
                </CardContent></Card>
            ))}
        </div>
    </div>
);

export default Page;