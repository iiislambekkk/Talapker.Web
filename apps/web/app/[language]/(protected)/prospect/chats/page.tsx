"use client"

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { ambassadorsQueryOptions } from "@/lib/tanstackQuery/options/ambassadorsQueryOptions";
import { queryOptions } from "@tanstack/react-query";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useLang } from "@/hooks/useLang";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { MessageSquare, Star, Clock, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {useProspectStore} from "@/lib/stores/prospectStore";

const t = {
    ru: {
        chats: "Чаты",
        ambassadors: "Амбассадоры",
        noInstitution: "Выберите университет в меню",
        activeChats: "Активные чаты",
        allAmbassadors: "Все амбассадоры",
        startChat: "Написать",
        openChat: "Открыть",
        noChats: "Чатов пока нет",
        lastMessage: "Последнее сообщение",
        studyYear: "курс",
        rating: "Рейтинг",
        helpfulVotes: "Полезных ответов",
        inactive: "Неактивен",
    },
    kk: {
        chats: "Чаттар",
        ambassadors: "Амбассадорлар",
        noInstitution: "Мәзірден университетті таңдаңыз",
        activeChats: "Белсенді чаттар",
        allAmbassadors: "Барлық амбассадорлар",
        startChat: "Жазу",
        openChat: "Ашу",
        noChats: "Чаттар әлі жоқ",
        lastMessage: "Соңғы хабарлама",
        studyYear: "курс",
        rating: "Рейтинг",
        helpfulVotes: "Пайдалы жауаптар",
        inactive: "Белсенді емес",
    },
    en: {
        chats: "Chats",
        ambassadors: "Ambassadors",
        noInstitution: "Select a university from the menu",
        activeChats: "Active chats",
        allAmbassadors: "All ambassadors",
        startChat: "Message",
        openChat: "Open",
        noChats: "No chats yet",
        lastMessage: "Last message",
        studyYear: "year",
        rating: "Rating",
        helpfulVotes: "Helpful votes",
        inactive: "Inactive",
    },
};

const prospectChatsQueryOptions = (prospectId: string, institutionId: string) => queryOptions({
    queryKey: ["prospect", "chats", prospectId, institutionId],
    queryFn: async () => {
        const api = createApi();
        const res = await api.get(`/api/chats/prospect?prospectId=${prospectId}&institutionId=${institutionId}`);
        return res.data as ChatRoomDto[];
    },
    enabled: !!prospectId && !!institutionId,
});

interface ChatRoomDto {
    id: string;
    prospectId: string;
    ambassadorId: string;
    ambassadorName: string;
    ambassadorAvatarUrl?: string | null;
    institutionId: string;
    createdAt: string;
    lastMessageAt?: string | null;
    lastMessage?: {
        id: string;
        text: string;
        sentAt: string;
        senderId: string;
        isRead: boolean;
    } | null;
}

const ProspectChatsPage = () => {
    const [lang] = useLang();
    const labels = t[lang as keyof typeof t] ?? t.ru;
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const prospectId = session?.user?.sub ?? "";
    const { selectedInstitutionId } = useProspectStore();
    

    const { data: chats, status: chatsStatus } = useQuery(
        prospectChatsQueryOptions(prospectId, selectedInstitutionId ?? "")
    );
    const { data: ambassadors, status: ambassadorsStatus } = useQuery({
        ...ambassadorsQueryOptions(selectedInstitutionId ?? ""),
        enabled: !!selectedInstitutionId,
    });

    const chatAmbassadorIds = new Set(chats?.map(c => c.ambassadorId) ?? []);

    const createRoomMutation = useMutation({
        mutationFn: async (ambassadorId: string) => {
            const api = createApi();
            const res = await api.post("/api/chats/room", {
                prospectId,
                ambassadorId,
                institutionId: selectedInstitutionId,
            });
            return res.data as ChatRoomDto;
        },
        onSuccess: (room) => {
            queryClient.invalidateQueries({ queryKey: ["prospect", "chats"] });
            router.push(`/${lang}/prospect/chats/${room.id}`);
        },
        onError: (err) => {
            logger.error("[Chats] Failed to create room:", err);
            toast.error(labels.noChats);
        },
    });

    if (!selectedInstitutionId) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                {labels.noInstitution}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <Tabs defaultValue="chats">
                <TabsList>
                    <TabsTrigger value="chats">{labels.activeChats}</TabsTrigger>
                    <TabsTrigger value="ambassadors">{labels.allAmbassadors}</TabsTrigger>
                </TabsList>

                {/* ── Active chats ── */}
                <TabsContent value="chats" className="mt-4">
                    {chatsStatus === "pending" && (
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 rounded-xl" />
                            ))}
                        </div>
                    )}

                    {chatsStatus === "success" && chats.length === 0 && (
                        <p className="text-muted-foreground">{labels.noChats}</p>
                    )}

                    {chatsStatus === "success" && chats.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {chats.map(chat => (
                                <Card
                                    key={chat.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors py-0"
                                    onClick={() => router.push(`/${lang}/prospect/chats/${chat.id}`)}
                                >
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar className="w-12 h-12 shrink-0">
                                            <AvatarImage src={chat.ambassadorAvatarUrl ?? ""} />
                                            <AvatarFallback>{chat.ambassadorName?.[0] ?? "A"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <p className="font-medium">{chat.ambassadorName}</p>
                                            {chat.lastMessage && (
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {chat.lastMessage.text}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {chat.lastMessageAt && (
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(chat.lastMessageAt).toLocaleDateString(lang)}
                                                </span>
                                            )}
                                            {chat.lastMessage && !chat.lastMessage.isRead &&
                                                chat.lastMessage.senderId !== prospectId && (
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ── All ambassadors ── */}
                <TabsContent value="ambassadors" className="mt-4">
                    {ambassadorsStatus === "pending" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-44 rounded-xl" />
                            ))}
                        </div>
                    )}

                    {ambassadorsStatus === "success" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ambassadors.map(ambassador => {
                                const hasChat = chatAmbassadorIds.has(ambassador.id);
                                const existingChat = chats?.find(c => c.ambassadorId === ambassador.id);

                                return (
                                    <Card key={ambassador.id} className="py-0">
                                        <CardContent className="p-4 flex flex-col gap-3">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="w-12 h-12 shrink-0">
                                                    <AvatarImage src={ambassador.avatarUrl ?? ""} />
                                                    <AvatarFallback>{ambassador.firstName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-medium">
                                                            {ambassador.firstName} {ambassador.lastName}
                                                        </p>
                                                        {!ambassador.isActive && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {labels.inactive}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {ambassador.tagline && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {ambassador.tagline}
                                                        </p>
                                                    )}
                                                    {ambassador.educationalProgramName && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {ambassador.educationalProgramName} · {ambassador.studyYear} {labels.studyYear}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-3 h-3" />
                                                    {ambassador.rating.toFixed(1)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" />
                                                    {ambassador.helpfulVotes}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {ambassador.totalChats}
                                                </span>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant={hasChat ? "outline" : "default"}
                                                className="w-full"
                                                disabled={createRoomMutation.isPending}
                                                onClick={() => hasChat
                                                    ? router.push(`/${lang}/prospect/chats/${existingChat!.id}`)
                                                    : createRoomMutation.mutate(ambassador.id)
                                                }
                                            >
                                                <MessageSquare className="w-3 h-3 mr-1" />
                                                {hasChat ? labels.openChat : labels.startChat}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProspectChatsPage;