"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { createApi } from "@/lib/axios";
import { logger } from "@/lib/logger";
import { useLang } from "@/hooks/useLang";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
    Clock, CheckCircle2, XCircle, Ban,
    Hourglass, Mail, Send, CalendarDays, UserCheck,
} from "lucide-react";

// ─── i18n ─────────────────────────────────────────────────────────────────────

type Lang = "ru" | "kk" | "en";

const t = {
    title:        { ru: "Приглашения",               kk: "Шақырулар",                  en: "Invitations"                },
    pending:      { ru: "Ожидают",                   kk: "Күтуде",                     en: "Pending"                    },
    accepted:     { ru: "Принятые",                  kk: "Қабылданған",                en: "Accepted"                   },
    sent:         { ru: "Отправлено",                kk: "Жіберілді",                  en: "Sent"                       },
    expires:      { ru: "Истекает",                  kk: "Мерзімі",                    en: "Expires"                    },
    expiresSoon:  { ru: "· скоро",                   kk: "· жақында",                  en: "· soon"                     },
    responded:    { ru: "Ответил",                   kk: "Жауап берді",                en: "Responded"                  },
    empty:        { ru: "Приглашений пока нет",       kk: "Шақырулар әлі жоқ",          en: "No invitations yet"         },
    emptyHint:    { ru: "Пригласите первого амбассадора через кнопку выше.", kk: "Жоғарыдағы түйме арқылы алғашқы амбассадорды шақырыңыз.", en: "Invite your first ambassador using the button above." },
    error:        { ru: "Не удалось загрузить приглашения.", kk: "Шақыруларды жүктеу сәтсіз болды.", en: "Failed to load invitations." },
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
        logger.log("[InvitationsSection] fetched", res.data);
        return res.data.data;
    },
});

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

// ─── Summary chips ────────────────────────────────────────────────────────────

function SummaryChips({ invitations, l }: { invitations: InvitationDto[]; l: Lang }) {
    const counts = invitations.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chips = [
        { status: "Pending",  color: "text-yellow-500",       bg: "bg-yellow-500/10 border-yellow-500/20"    },
        { status: "Accepted", color: "text-green-500",        bg: "bg-green-500/10  border-green-500/20"     },
        { status: "Declined", color: "text-destructive",      bg: "bg-destructive/10 border-destructive/20"  },
        { status: "Expired",  color: "text-muted-foreground", bg: "bg-muted/60 border-border"                },
    ] as const;

    return (
        <div className="flex flex-wrap gap-2">
            {chips.map(({ status, color, bg }) =>
                counts[status] ? (
                    <span key={status}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${bg} ${color}`}>
                        {React.createElement(STATUS_CONFIG[status as InvitationStatus].icon, { className: "w-3 h-3" })}
                        {counts[status]} {t.status[status as InvitationStatus][l]}
                    </span>
                ) : null
            )}
        </div>
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
            transition={{ delay: index * 0.04, duration: 0.2, ease: "easeOut" }}
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

// ─── Main ─────────────────────────────────────────────────────────────────────

interface InvitationsSectionProps {
    institutionId: string;
}

export default function InvitationsSection({ institutionId }: InvitationsSectionProps) {
    const { data: session } = useSession();
    const [rawLang] = useLang();
    const l: Lang = (["ru", "kk", "en"] as Lang[]).includes(rawLang as Lang) ? (rawLang as Lang) : "en";

    const { data: invitations, status } = useQuery(
        invitationsQueryOptions(institutionId, session?.accessToken)
    );

    const pending  = invitations?.filter(i => i.status === "Pending").length  ?? 0;
    const accepted = invitations?.filter(i => i.status === "Accepted").length ?? 0;

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Send className="w-4 h-4 text-muted-foreground" />
                            {t.title[l]}
                        </CardTitle>
                        {status === "success" && invitations && invitations.length > 0 && (
                            <div className="mt-2">
                                <SummaryChips invitations={invitations} l={l} />
                            </div>
                        )}
                    </div>

                    {status === "success" && invitations && invitations.length > 0 && (
                        <div className="flex gap-3 text-center">
                            <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <p className="text-lg font-bold text-yellow-500 leading-none">{pending}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{t.pending[l]}</p>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                                <p className="text-lg font-bold text-green-500 leading-none">{accepted}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{t.accepted[l]}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {status === "pending" && (
                    <div className="space-y-2.5">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border bg-card">
                                <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                )}

                {status === "error" && (
                    <p className="text-sm text-destructive text-center py-8">{t.error[l]}</p>
                )}

                {status === "success" && (
                    invitations && invitations.length > 0 ? (
                        <div className="space-y-2">
                            {invitations.map((inv, i) => (
                                <InvitationRow key={inv.id} inv={inv} index={i} l={l} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Send className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium mb-1">{t.empty[l]}</p>
                            <p className="text-xs text-muted-foreground">{t.emptyHint[l]}</p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}