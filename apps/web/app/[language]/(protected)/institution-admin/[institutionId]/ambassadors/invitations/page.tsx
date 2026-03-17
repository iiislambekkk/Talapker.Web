"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { createApi } from "@/lib/axios";
import { logger } from "@/lib/logger";
import { useLang } from "@/hooks/useLang";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import {
    Clock, CheckCircle2, XCircle, Ban, Hourglass,
    Mail, Send, CalendarDays, UserCheck, Users,
    MailCheck, MailX, Timer,
} from "lucide-react";
import InviteAmbassadorForm from "./_components/InviteAmbassadorForm";


type Lang = "ru" | "kk" | "en";

const t = {
    title:        { ru: "Приглашения",                   kk: "Шақырулар",                       en: "Invitations"                    },
    subtitle:     { ru: "Управляйте приглашениями амбассадоров", kk: "Амбассадор шақыруларын басқарыңыз", en: "Manage your ambassador invitations" },
    tabs: {
        all:      { ru: "Все",                           kk: "Барлығы",                         en: "All"                            },
        pending:  { ru: "Ожидают",                       kk: "Күтуде",                          en: "Pending"                        },
        accepted: { ru: "Принятые",                      kk: "Қабылданған",                     en: "Accepted"                       },
        declined: { ru: "Отклонённые",                   kk: "Қабылданбаған",                   en: "Declined"                       },
    },
    stats: {
        total:    { ru: "Всего отправлено",               kk: "Барлығы жіберілді",               en: "Total Sent"                     },
        pending:  { ru: "Ожидают ответа",                 kk: "Жауап күтуде",                    en: "Awaiting Response"              },
        accepted: { ru: "Приняли",                        kk: "Қабылдады",                       en: "Accepted"                       },
        declined: { ru: "Отклонили",                      kk: "Қабылдамады",                     en: "Declined"                       },
    },
    sent:         { ru: "Отправлено",                    kk: "Жіберілді",                       en: "Sent"                           },
    expires:      { ru: "Истекает",                      kk: "Мерзімі",                         en: "Expires"                        },
    expiresSoon:  { ru: "· скоро",                       kk: "· жақында",                       en: "· soon"                         },
    responded:    { ru: "Ответил",                       kk: "Жауап берді",                     en: "Responded"                      },
    empty:        { ru: "Нет приглашений",               kk: "Шақырулар жоқ",                   en: "No invitations"                 },
    emptyHint:    { ru: "Отправьте первое приглашение через кнопку выше.", kk: "Жоғарыдағы түйме арқылы алғашқы шақыру жіберіңіз.", en: "Send your first invitation using the button above." },
    error:        { ru: "Не удалось загрузить.",         kk: "Жүктеу сәтсіз болды.",            en: "Failed to load."                },
    status: {
        Pending:  { ru: "Ожидает",    kk: "Күтуде",       en: "Pending"  },
        Accepted: { ru: "Принято",    kk: "Қабылданды",   en: "Accepted" },
        Declined: { ru: "Отклонено",  kk: "Қабылданбады", en: "Declined" },
        Expired:  { ru: "Истекло",    kk: "Мерзімі өтті", en: "Expired"  },
        Revoked:  { ru: "Отозвано",   kk: "Қайтарылды",   en: "Revoked"  },
    },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type InvitationStatus = "Pending" | "Accepted" | "Declined" | "Expired" | "Revoked";

interface InvitationDto {
    id: string;
    email: string;
    tenantId: string;
    role: string;
    status: InvitationStatus;
    createdAt: string;
    expiresAt: string;
    respondedAt?: string;
    invitedByUserId?: string;
    acceptedByUserId?: string;
}

// ─── Query ────────────────────────────────────────────────────────────────────

const invitationsQueryOptions = (institutionId: string, accessToken?: string) => ({
    queryKey: ["invitations", institutionId, "TenantAmbassador"],
    queryFn: async (): Promise<InvitationDto[]> => {
        const api = createApi(accessToken);
        const res = await api.get("/api/user/invitations", {
            params: { tenantId: institutionId, role: "TenantAmbassador" },
        });
        logger.log("[InvitationsPage] fetched", res.data);
        return res.data.data;
    },
});

export {invitationsQueryOptions};
// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InvitationStatus, {
    icon: React.ElementType;
    variant: "default" | "secondary" | "outline" | "destructive" | "green" | "yellow";
    rowOpacity: string;
}> = {
    Pending:  { icon: Hourglass,    variant: "yellow",      rowOpacity: ""           },
    Accepted: { icon: CheckCircle2, variant: "green",       rowOpacity: ""           },
    Declined: { icon: XCircle,      variant: "destructive", rowOpacity: "opacity-60" },
    Expired:  { icon: Clock,        variant: "secondary",   rowOpacity: "opacity-50" },
    Revoked:  { icon: Ban,          variant: "secondary",   rowOpacity: "opacity-50" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (date: string) =>
    new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const isExpiringSoon = (expiresAt: string, status: InvitationStatus) => {
    if (status !== "Pending") return false;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 2;
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
                      label, value, icon: Icon, colorClass, bgClass,
                  }: {
    label: string; value: number;
    icon: React.ElementType; colorClass: string; bgClass: string;
}) {
    return (
        <Card className={`border-0 ${bgClass}`}>
            <CardContent className="p-5">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-background/40`}>
                        <Icon className={`w-5 h-5 ${colorClass}`} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold leading-none mb-0.5">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function InvitationRow({ inv, index, l }: { inv: InvitationDto; index: number; l: Lang }) {
    const cfg      = STATUS_CONFIG[inv.status];
    const Icon     = cfg.icon;
    const expiring = isExpiringSoon(inv.expiresAt, inv.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035, duration: 0.2, ease: "easeOut" }}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border bg-card
                hover:bg-accent/40 transition-colors duration-150 ${cfg.rowOpacity}`}
        >
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{inv.email}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Send className="w-3 h-3" />
                        {t.sent[l]} {fmt(inv.createdAt)}
                    </span>
                    {inv.status === "Pending" && (
                        <span className={`flex items-center gap-1 text-xs ${expiring ? "text-yellow-500 font-medium" : "text-muted-foreground"}`}>
                            <CalendarDays className="w-3 h-3" />
                            {t.expires[l]} {fmt(inv.expiresAt)}
                            {expiring && ` ${t.expiresSoon[l]}`}
                        </span>
                    )}
                    {inv.respondedAt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <UserCheck className="w-3 h-3" />
                            {t.responded[l]} {fmt(inv.respondedAt)}
                        </span>
                    )}
                </div>
            </div>

            <Badge variant={cfg.variant} className="gap-1 flex-shrink-0">
                <Icon className="w-3 h-3" />
                {t.status[inv.status][l]}
            </Badge>
        </motion.div>
    );
}

// ─── List ─────────────────────────────────────────────────────────────────────

function InvitationList({ invitations, l }: { invitations: InvitationDto[]; l: Lang }) {
    if (invitations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Send className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">{t.empty[l]}</p>
                <p className="text-xs text-muted-foreground max-w-xs">{t.emptyHint[l]}</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {invitations.map((inv, i) => (
                <InvitationRow key={inv.id} inv={inv} index={i} l={l} />
            ))}
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-start">
                <div><Skeleton className="h-9 w-48 mb-2" /><Skeleton className="h-5 w-72" /></div>
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Card key={i}><CardContent className="p-5"><Skeleton className="h-14 w-full" /></CardContent></Card>)}
            </div>
            <Card>
                <CardContent className="p-6 space-y-3">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
    const { institutionId } = useParams() as { institutionId: string };
    const { data: session } = useSession();
    const [rawLang] = useLang();
    const l: Lang = (["ru", "kk", "en"] as Lang[]).includes(rawLang as Lang) ? (rawLang as Lang) : "en";

    const { data: invitations, status } = useQuery(
        invitationsQueryOptions(institutionId, session?.accessToken)
    );

    if (status === "pending") return <PageSkeleton />;

    if (status === "error") {
        return (
            <div className="container mx-auto py-8">
                <p className="text-sm text-destructive">{t.error[l]}</p>
            </div>
        );
    }

    const byStatus = (s: InvitationStatus) => invitations.filter(i => i.status === s);
    const total    = invitations.length;
    const pending  = byStatus("Pending").length;
    const accepted = byStatus("Accepted").length;
    const declined = byStatus("Declined").length;

    return (
        <div className="container mx-auto py-8 space-y-8">

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{t.title[l]}</h1>
                    <p className="text-muted-foreground mt-1">{t.subtitle[l]}</p>
                </div>
                <InviteAmbassadorForm institutionId={institutionId} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label={t.stats.total[l]}    value={total}    icon={Users}     colorClass="text-blue-500"   bgClass="bg-gradient-to-br from-blue-500/50 to-blue-500/20"     />
                <StatCard label={t.stats.pending[l]}  value={pending}  icon={Timer}     colorClass="text-yellow-500" bgClass="bg-gradient-to-br from-yellow-500/50 to-yellow-500/20"  />
                <StatCard label={t.stats.accepted[l]} value={accepted} icon={MailCheck} colorClass="text-green-500"  bgClass="bg-gradient-to-br from-green-500/50 to-green-500/20"    />
                <StatCard label={t.stats.declined[l]} value={declined} icon={MailX}     colorClass="text-destructive" bgClass="bg-gradient-to-br from-destructive/50 to-destructive/20" />
            </div>

            {/* Tabs + list */}
            <Card>
                <CardHeader className="pb-0">
                    <Tabs defaultValue="all">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="all">
                                {t.tabs.all[l]}
                                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">{total}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="pending">
                                {t.tabs.pending[l]}
                                {pending > 0 && <Badge variant="yellow" className="ml-1.5 text-xs px-1.5 py-0">{pending}</Badge>}
                            </TabsTrigger>
                            <TabsTrigger value="accepted">
                                {t.tabs.accepted[l]}
                                {accepted > 0 && <Badge variant="green" className="ml-1.5 text-xs px-1.5 py-0">{accepted}</Badge>}
                            </TabsTrigger>
                            <TabsTrigger value="declined">
                                {t.tabs.declined[l]}
                                {declined > 0 && <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">{declined}</Badge>}
                            </TabsTrigger>
                        </TabsList>

                        <CardContent className="pt-4">
                            <TabsContent value="all"      className="mt-0"><InvitationList invitations={invitations}          l={l} /></TabsContent>
                            <TabsContent value="pending"  className="mt-0"><InvitationList invitations={byStatus("Pending")}  l={l} /></TabsContent>
                            <TabsContent value="accepted" className="mt-0"><InvitationList invitations={byStatus("Accepted")} l={l} /></TabsContent>
                            <TabsContent value="declined" className="mt-0"><InvitationList invitations={[...byStatus("Declined"), ...byStatus("Expired"), ...byStatus("Revoked")]} l={l} /></TabsContent>
                        </CardContent>
                    </Tabs>
                </CardHeader>
            </Card>
        </div>
    );
};

export default Page;