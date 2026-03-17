"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useInfiniteQuery, infiniteQueryOptions } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { queryOptions } from "@tanstack/react-query";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useLang } from "@/hooks/useLang";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import * as signalR from "@microsoft/signalr";
import {generateS3UrlFromKey} from "@/lib/generateS3UrlFromKey";

const t = {
    ru: { placeholder: "Написать сообщение...", back: "Назад", error: "Ошибка отправки", connecting: "Подключение...", today: "Сегодня", yesterday: "Вчера" },
    kk: { placeholder: "Хабарлама жазу...", back: "Артқа", error: "Жіберу қатесі", connecting: "Қосылуда...", today: "Бүгін", yesterday: "Кеше" },
    en: { placeholder: "Write a message...", back: "Back", error: "Send error", connecting: "Connecting...", today: "Today", yesterday: "Yesterday" },
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
    prospectAvatarUrl: string | null;
}

const chatMessagesInfiniteOptions = (chatRoomId: string) => infiniteQueryOptions({
    queryKey: ["chat", "messages", chatRoomId],
    queryFn: async ({ pageParam = 1 }) => {
        const api = createApi();
        const res = await api.get(`/api/chats/room/${chatRoomId}/messages?page=${pageParam}&pageSize=50`);
        return res.data as ChatMessageDto[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
        lastPage.length === 50 ? allPages.length + 1 : undefined,
    enabled: !!chatRoomId,
});

const chatRoomQueryOptions = (chatRoomId: string) => queryOptions({
    queryKey: ["chat", "room", chatRoomId],
    queryFn: async () => {
        const api = createApi();
        const res = await api.get(`/api/chats/room/${chatRoomId}`);
        return res.data as ChatRoomDto;
    },
    enabled: !!chatRoomId,
});

const formatDateLabel = (date: Date, today: string, yesterday: string, lang: string) => {
    const now = new Date();
    const d = new Date(date);
    const isToday = d.toDateString() === now.toDateString();
    const isYesterday = d.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();
    if (isToday) return today;
    if (isYesterday) return yesterday;
    return d.toLocaleDateString(lang);
};

const groupMessagesByDate = (messages: ChatMessageDto[]) => {
    const groups: { label: string; messages: ChatMessageDto[] }[] = [];
    let currentLabel = "";

    for (const msg of messages) {
        const label = new Date(msg.sentAt).toDateString();
        if (label !== currentLabel) {
            currentLabel = label;
            groups.push({ label, messages: [msg] });
        } else {
            groups[groups.length - 1].messages.push(msg);
        }
    }

    return groups;
};

const ProspectChatRoomPage = () => {
    const [lang] = useLang();
    const labels = t[lang as keyof typeof t] ?? t.ru;
    const params = useParams();
    const router = useRouter();
    const chatRoomId = params.id as string;
    const { data: session } = useSession();
    const prospectId = session?.user?.sub ?? "";

    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [inputText, setInputText] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isFirstLoad = useRef(true);

    const { data: room, status: roomStatus } = useQuery(chatRoomQueryOptions(chatRoomId));

    const {
        data: historyData,
        status: historyStatus,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery(chatMessagesInfiniteOptions(chatRoomId));

    // Flatten pages (страницы приходят в обратном порядке — переворачиваем)
    useEffect(() => {
        if (!historyData) return;
        const all = historyData.pages.slice().reverse().flat();
        setMessages(all);
    }, [historyData]);

    // Scroll to bottom только при первой загрузке
    useEffect(() => {
        if (messages.length > 0 && isFirstLoad.current) {
            bottomRef.current?.scrollIntoView({ behavior: "instant" });
            isFirstLoad.current = false;
        }
    }, [messages]);

    // Scroll to bottom на новое входящее сообщение через SignalR
    const prevMessageCount = useRef(0);
    useEffect(() => {
        if (messages.length > prevMessageCount.current && !isFirstLoad.current) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        prevMessageCount.current = messages.length;
    }, [messages]);

    // Infinite scroll вверх
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
                const prevScrollHeight = container.scrollHeight;
                fetchNextPage().then(() => {
                    requestAnimationFrame(() => {
                        container.scrollTop = container.scrollHeight - prevScrollHeight;
                    });
                });
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // SignalR
    useEffect(() => {
        if (!chatRoomId) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hubs/chat`)
            .withAutomaticReconnect()
            .build();

        connection.on("ReceiveMessage", (message: ChatMessageDto) => {
            setMessages(prev => [...prev, message]);
        });

        connection.onclose(() => setIsConnected(false));
        connection.onreconnected(() => setIsConnected(true));

        connection.start()
            .then(async () => {
                await connection.invoke("JoinRoom", chatRoomId);
                setIsConnected(true);
                logger.log("[Chat] Connected and joined room:", chatRoomId);
            })
            .catch(err => logger.error("[Chat] Connection failed:", err));

        connectionRef.current = connection;

        return () => {
            connection.invoke("LeaveRoom", chatRoomId)
                .catch(() => {})
                .finally(() => connection.stop());
        };
    }, [chatRoomId]);

    const sendMessage = async () => {
        const text = inputText.trim();
        if (!text || !isConnected || !connectionRef.current) return;

        try {
            await connectionRef.current.invoke("SendMessage", {
                chatRoomId,
                senderId: prospectId,
                text,
            });
            setInputText("");
            inputRef.current?.focus();
        } catch (err) {
            logger.error("[Chat] Send failed:", err);
            toast.error(labels.error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="flex flex-col h-[calc(100vh-var(--header-height)-2rem)] max-h-[800px]">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>

                {roomStatus === "pending" ? (
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="w-32 h-4" />
                    </div>
                ) : roomStatus === "success" && (
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={generateS3UrlFromKey(room.prospectAvatarUrl ?? "")} />
                            <AvatarFallback>{room.ambassadorName?.[0] ?? "A"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <p className="font-medium text-sm">{room?.prospectName}</p>
                            <p className="text-xs text-muted-foreground">
                                {isConnected ? (
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                        Online
                                    </span>
                                ) : labels.connecting}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 min-h-0"
            >
                {isFetchingNextPage && (
                    <div className="flex justify-center py-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                )}

                {historyStatus === "pending" && (
                    <div className="flex flex-col gap-3 px-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                                <Skeleton className="h-10 w-48 rounded-2xl" />
                            </div>
                        ))}
                    </div>
                )}

                {historyStatus === "success" && messageGroups.map((group) => (
                    <div key={group.label} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 my-2 px-2">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground">
                                {formatDateLabel(new Date(group.messages[0].sentAt), labels.today, labels.yesterday, lang)}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {group.messages.map((msg) => {
                            const isOwn = msg.senderId === prospectId;
                            return (
                                <div key={msg.id} className={`flex px-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex flex-col max-w-[70%] gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
                                        <div className={`px-3 py-2 rounded-2xl text-sm ${
                                            isOwn
                                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                                : "bg-muted rounded-bl-sm"
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground px-1">
                                            {new Date(msg.sentAt).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 pt-4 border-t shrink-0">
                <Input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={labels.placeholder}
                    className="flex-1"
                    disabled={!isConnected}
                />
                <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={!inputText.trim() || !isConnected}
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default ProspectChatRoomPage;