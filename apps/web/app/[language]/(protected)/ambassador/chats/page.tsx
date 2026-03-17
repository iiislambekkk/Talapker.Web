"use client"

import React from 'react';
import { useQuery, queryOptions } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLang } from "@/hooks/useLang";
import { createApi } from "@/lib/axios";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { MessageSquare } from "lucide-react";

const t = {
    ru: { title: "Чаты", noChats: "Чатов пока нет", unread: "Новое" },
    kk: { title: "Чаттар", noChats: "Чаттар әлі жоқ", unread: "Жаңа" },
    en: { title: "Chats", noChats: "No chats yet", unread: "New" },
};

interface ChatMessageDto {
    id: string;
    chatRoomId: string;
    senderId: string;
    senderName: string;
    text: string;
    sentAt: string;
    isRead: boolean;
}

interface ChatRoomDto {
    id: string;
    prospectId: string;
    prospectName: string;
    ambassadorId: string;
    ambassadorName: string;
    ambassadorAvatarUrl?: string | null;
    institutionId: string;
    createdAt: string;
    lastMessageAt?: string | null;
    lastMessage?: ChatMessageDto | null;
}

const ambassadorChatsQueryOptions = (userId: string) => queryOptions({
    queryKey: ["ambassador", "chats", userId],
    queryFn: async () => {
        const api = createApi();
        const res = await api.get(`/api/chats/ambassador?userId=${userId}`);
        return res.data as ChatRoomDto[];
    },
    enabled: !!userId,
});

const Page = () => {
    const [lang] = useLang();
    const labels = t[lang as keyof typeof t] ?? t.ru;
    const router = useRouter();
    const { data: session } = useSession();
    const userId = session?.user?.sub ?? "";

    const { data: chats, status } = useQuery(ambassadorChatsQueryOptions(userId));

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold">{labels.title}</h1>

            {status === "pending" && (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                </div>
            )}

            {status === "success" && chats.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 opacity-30" />
                    <p>{labels.noChats}</p>
                </div>
            )}

            {status === "success" && chats.length > 0 && (
                <div className="flex flex-col gap-2">
                    {chats.map(chat => {
                        const hasUnread = chat.lastMessage &&
                            !chat.lastMessage.isRead &&
                            chat.lastMessage.senderId !== userId;

                        return (
                            <Card
                                key={chat.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors py-0"
                                onClick={() => router.push(`/ambassador/chats/${chat.id}`)}
                            >
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar className="w-12 h-12 shrink-0">
                                        <AvatarFallback>{chat.prospectName?.[0]?.toUpperCase() ?? "P"}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="font-medium text-sm">{chat.prospectName}</p>
                                        {chat.lastMessage ? (
                                            <p className={`text-sm truncate ${hasUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                                                {chat.lastMessage.text}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">—</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        {chat.lastMessageAt && (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(chat.lastMessageAt).toLocaleDateString(lang, {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                })}
                                            </span>
                                        )}
                                        {hasUnread && (
                                            <Badge className="text-[10px] px-1.5 py-0 h-5">
                                                {labels.unread}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Page;