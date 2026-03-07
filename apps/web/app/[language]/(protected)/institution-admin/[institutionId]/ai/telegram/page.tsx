"use client"
import React, { useState } from 'react';
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/hooks/useLang";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
    Bot, CheckCircle, XCircle, Calendar, Hash,
    MessageSquare, Users, ChevronRight, ArrowLeft,
    Clock, User, ChevronLeft, Shield, Zap, Key,
    ExternalLink, Info, Sparkles, Lock
} from 'lucide-react';
import { logger } from "@/lib/logger";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { AddTelegramBotForm } from "./_components/AddTelegramBotForm";
import { DeleteTelegramBotForm } from "./_components/DeleteTelegramBotForm";

type Lang = "ru" | "kk" | "en";

const t = {
    title:               { ru: "Telegram Бот",                                      kk: "Telegram Бот",                                         en: "Telegram Bot"                                        },
    subtitle:            { ru: "Управление Telegram ботом учреждения",              kk: "Мекеменің Telegram ботын басқару",                     en: "Manage your institution's Telegram bot"              },
    noBotTitle:          { ru: "Бот не подключён",                                  kk: "Бот қосылмаған",                                       en: "No Bot Connected"                                    },
    noBotDesc:           { ru: "Подключите Telegram бота, чтобы студенты могли задавать вопросы напрямую.", kk: "Студенттер тікелей сұрақ қоя алуы үшін Telegram ботын қосыңыз.", en: "Connect a Telegram bot so students can ask questions directly." },
    active:              { ru: "Активен",                                           kk: "Белсенді",                                             en: "Active"                                              },
    inactive:            { ru: "Неактивен",                                         kk: "Белсенді емес",                                        en: "Inactive"                                            },
    connectedSince:      { ru: "Подключён",                                         kk: "Қосылған",                                             en: "Connected since"                                     },
    chatHistory:         { ru: "История чатов",                                     kk: "Чат тарихы",                                           en: "Chat History"                                        },
    chatHistorySub:      { ru: "Переписка пользователей с ботом",                   kk: "Пайдаланушылардың ботпен хат алмасуы",                 en: "User conversations with the bot"                     },
    noChats:             { ru: "Чатов пока нет",                                    kk: "Чаттар әлі жоқ",                                       en: "No chats yet"                                        },
    noChatsDesc:         { ru: "Как только пользователи начнут писать боту, их история появится здесь.", kk: "Пайдаланушылар ботқа жаза бастаған кезде олардың тарихы осында пайда болады.", en: "Once users start messaging the bot, their history will appear here." },
    messages:            { ru: "сообщений",                                         kk: "хабарлама",                                            en: "messages"                                            },
    back:                { ru: "Назад",                                              kk: "Артқа",                                                en: "Back"                                                },
    howItWorksTitle:     { ru: "Как это работает",                                  kk: "Бұл қалай жұмыс істейді",                              en: "How it works"                                        },
    step1:               { ru: "Создайте бота через @BotFather в Telegram",         kk: "@BotFather арқылы Telegram-да бот жасаңыз",            en: "Create a bot via @BotFather in Telegram"             },
    step2:               { ru: "Скопируйте токен и вставьте его ниже",              kk: "Токенді көшіріп, төменге қойыңыз",                     en: "Copy the token and paste it below"                   },
    step3:               { ru: "Студенты пишут боту — AI отвечает автоматически",   kk: "Студенттер ботқа жазады — AI автоматты жауап береді",  en: "Students message the bot — AI replies automatically"  },
    whyBotFatherTitle:   { ru: "Почему управление через @BotFather?",               kk: "Неге @BotFather арқылы басқарылады?",                   en: "Why manage through @BotFather?"                      },
    whyBotFatherDesc:    { ru: "Telegram требует, чтобы все боты создавались и управлялись через официальный сервис @BotFather. Мы намеренно не создаём бота от своего имени — это значит, что бот принадлежит вам, а не нам.", kk: "Telegram барлық боттар ресми @BotFather қызметі арқылы жасалып, басқарылуын талап етеді. Біз ботты өз атымыздан жасамаймыз — бұл боттың бізге емес, сізге тиесілі екенін білдіреді.", en: "Telegram requires all bots to be created and managed through the official @BotFather service. We intentionally don't create the bot on your behalf — this means the bot belongs to you, not us." },
    ownershipTitle:      { ru: "Полный контроль у вас",                             kk: "Толық бақылау сізде",                                  en: "You have full ownership"                             },
    ownershipDesc:       { ru: "Вы можете в любой момент изменить имя, описание, аватар бота или отключить его — всё это делается в @BotFather независимо от нашего сервиса.", kk: "Кез келген уақытта боттың атын, сипаттамасын, аватарын өзгертуге немесе оны өшіруге болады — мұның барлығы @BotFather-де біздің қызметімізден тәуелсіз жасалады.", en: "You can change the bot's name, description, avatar, or disable it at any time — all done in @BotFather independently of our service." },
    securityTitle:       { ru: "Безопасность токена",                               kk: "Токен қауіпсіздігі",                                   en: "Token security"                                      },
    securityDesc:        { ru: "Токен бота хранится в зашифрованном хранилище и никогда не передаётся третьим лицам. Только ваш бот использует его для получения сообщений.", kk: "Бот токені шифрланған қоймада сақталады және ешқашан үшінші тұлғаларға берілмейді. Тек сіздің ботыңыз хабарларды алу үшін оны пайдаланады.", en: "The bot token is stored in an encrypted vault and never shared with third parties. Only your bot uses it to receive messages." },
    manageBotFather:     { ru: "Управлять в @BotFather",                            kk: "@BotFather-де басқару",                                en: "Manage in @BotFather"                                },
    whatWeManage:        { ru: "Что мы берём на себя",                              kk: "Біз не жасаймыз",                                      en: "What we handle"                                      },
    feature1:            { ru: "Подключение бота к AI-ассистенту учреждения",       kk: "Ботты мекеменің AI-көмекшісіне қосу",                  en: "Connecting the bot to your institution's AI assistant"},
    feature2:            { ru: "Хранение истории переписки",                        kk: "Хат алмасу тарихын сақтау",                            en: "Storing conversation history"                        },
    feature3:            { ru: "Обработка входящих сообщений в реальном времени",   kk: "Кіріс хабарларды нақты уақытта өңдеу",                 en: "Processing incoming messages in real time"            },
} as const;

type BotDto = { id: string; botUsername: string; isActive: boolean; createdAt: string };
type TelegramBotUserDto = {
    telegramUserId: number;
    telegramUsername: string | null;
    lastMessage: string;
    lastActivityAt: string;
    totalMessages: number;
};
type PagedResult<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
};
type TelegramSessionMessageDto = {
    role: "user" | "assistant";
    content: string;
    createdAt: string;
};
type TelegramUserHistoryDto = {
    telegramUserId: number;
    telegramUsername: string | null;
    lastActivityAt: string;
    messages: TelegramSessionMessageDto[];
};

// ── Query options ──────────────────────────────────────────────────────────────

const telegramBotQueryOptions = (institutionId: string, accessToken: string) => ({
    queryKey: ['telegram-bot', institutionId],
    queryFn: async () => {
        try {
            const api = createApi(accessToken);
            const res = await api.get<BotDto>(`/api/telegram/institutions/${institutionId}`);
            return res.data;
        } catch (error: any) {
            if (error?.response?.status === 404) return null;
            throw error;
        }
    }
});

const telegramUsersQueryOptions = (institutionId: string, accessToken: string, page: number) => ({
    queryKey: ['telegram-users', institutionId, page],
    queryFn: async (): Promise<PagedResult<TelegramBotUserDto>> => {
        const api = createApi(accessToken);
        const res = await api.get(`/api/telegram/admin/institutions/${institutionId}/users`, {
            params: { page, pageSize: 15 }
        });
        return res.data;
    }
});

const telegramUserHistoryQueryOptions = (institutionId: string, accessToken: string, userId: number | null) => ({
    queryKey: ['telegram-user-history', institutionId, userId],
    enabled: userId !== null,
    queryFn: async (): Promise<TelegramUserHistoryDto> => {
        const api = createApi(accessToken);
        const res = await api.get(`/api/telegram/admin/institutions/${institutionId}/users/${userId}/history`);
        return res.data;
    }
});

// ── Page ───────────────────────────────────────────────────────────────────────

const Page = () => {
    const { institutionId } = useParams() as { institutionId: string };
    const { data: session } = useSession();
    const [lang] = useLang();
    const l: Lang = (lang as Lang) in t.title ? (lang as Lang) : "en";
    const { data: bot, status } = useQuery(telegramBotQueryOptions(institutionId, session?.accessToken ?? ""));

    logger.log("[TelegramBot] data:", bot);

    if (status !== "success") return <TelegramBotSkeleton />;

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-foreground">{t.title[l]}</h1>
                <p className="text-muted-foreground mt-1">{t.subtitle[l]}</p>
            </div>

            {bot ? (
                <>
                    <BotCard bot={bot} l={l} institutionId={institutionId} />
                    <InfoPanel l={l} hasBot />
                    <ChatHistorySection
                        institutionId={institutionId}
                        accessToken={session?.accessToken ?? ""}
                        l={l}
                    />
                </>
            ) : (
                <>
                    <NoBotCard l={l} institutionId={institutionId} />
                    <InfoPanel l={l} hasBot={false} />
                </>
            )}
        </div>
    );
};

// ── Bot card ───────────────────────────────────────────────────────────────────

const BotCard = ({ bot, l, institutionId }: { bot: BotDto; l: Lang; institutionId: string }) => (
    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 overflow-hidden relative">
        {/* subtle decorative circle */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-blue-500/5 pointer-events-none" />
        <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-indigo-500/5 pointer-events-none" />
        <CardContent className="p-8 relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-blue-500/20 rounded-2xl shrink-0">
                        <Bot className="w-10 h-10 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-bold">@{bot.botUsername}</h2>
                            {bot.isActive ? (
                                <Badge variant="green" className="gap-1">
                                    <CheckCircle className="w-3 h-3" /> {t.active[l]}
                                </Badge>
                            ) : (
                                <Badge variant="gray" className="gap-1">
                                    <XCircle className="w-3 h-3" /> {t.inactive[l]}
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5" />
                                <span className="font-mono text-xs">{bot.id}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{t.connectedSince[l]}: {new Date(bot.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <a
                        href="https://t.me/BotFather"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition-colors font-medium"
                    >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t.manageBotFather[l]}
                    </a>
                <div className="w-px h-4 bg-border" />
                <DeleteTelegramBotForm botId={bot.id} institutionId={institutionId} />
            </div>
        </div>
    </CardContent>
</Card>
);

// ── No bot card ────────────────────────────────────────────────────────────────

const NoBotCard = ({ l, institutionId }: { l: Lang; institutionId: string }) => (
    <Card className="border-dashed border-2">
        <CardContent className="p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-4 bg-muted rounded-2xl">
                <Bot className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
                <h3 className="text-xl font-semibold">{t.noBotTitle[l]}</h3>
                <p className="text-muted-foreground mt-1 max-w-md">{t.noBotDesc[l]}</p>
            </div>
            <AddTelegramBotForm institutionId={institutionId} />
        </CardContent>
    </Card>
);

// ── Info panel ─────────────────────────────────────────────────────────────────

const InfoPanel = ({ l, hasBot }: { l: Lang; hasBot: boolean }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Why BotFather */}
        <Card className="border-0 bg-gradient-to-br from-amber-500/8 to-orange-500/8 col-span-1 lg:col-span-2">
            <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/15 rounded-xl">
                        <Info className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">{t.whyBotFatherTitle[l]}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.whyBotFatherDesc[l]}</p>
                <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoTile icon={<Shield className="w-3.5 h-3.5 text-emerald-500" />} color="emerald" title={t.ownershipTitle[l]} desc={t.ownershipDesc[l]} />
                    <InfoTile icon={<Lock className="w-3.5 h-3.5 text-blue-500" />} color="blue" title={t.securityTitle[l]} desc={t.securityDesc[l]} />
                </div>
            </CardContent>
        </Card>

        {/* What we handle */}
        <Card className="border-0 bg-gradient-to-br from-violet-500/8 to-purple-500/8">
            <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-violet-500/15 rounded-xl">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">{t.whatWeManage[l]}</h3>
                </div>
                <div className="space-y-2.5">
                    {[
                        { icon: <Zap className="w-3.5 h-3.5 text-violet-500" />, text: t.feature1[l] },
                        { icon: <MessageSquare className="w-3.5 h-3.5 text-violet-500" />, text: t.feature2[l] },
                        { icon: <Bot className="w-3.5 h-3.5 text-violet-500" />, text: t.feature3[l] },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                            <div className="mt-0.5 p-1 bg-violet-500/10 rounded-lg shrink-0">{item.icon}</div>
                            <p className="text-sm text-muted-foreground leading-snug">{item.text}</p>
                        </div>
                    ))}
                </div>
                {!hasBot && (
                <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1.5 text-sm text-violet-500 hover:text-violet-400 transition-colors font-medium"
                    >
                    <ExternalLink className="w-3.5 h-3.5" />
                {t.manageBotFather[l]}
                    </a>
                    )}
            </CardContent>
        </Card>
    </div>
);

const InfoTile = ({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) => (
    <div className={`p-3.5 rounded-xl bg-${color}-500/8 space-y-1`}>
        <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-xs font-semibold text-foreground">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
);

// ── Chat history section ───────────────────────────────────────────────────────

const ChatHistorySection = ({ institutionId, accessToken, l }: {
    institutionId: string;
    accessToken: string;
    l: Lang;
}) => {
    const [page, setPage] = useState(1);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const { data: usersPage, status: usersStatus } = useQuery(
        telegramUsersQueryOptions(institutionId, accessToken, page)
    );
    const { data: history, status: historyStatus } = useQuery(
        telegramUserHistoryQueryOptions(institutionId, accessToken, selectedUserId)
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">{t.chatHistory[l]}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{t.chatHistorySub[l]}</p>
                </div>
                {usersPage && (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
                        <Users className="w-3.5 h-3.5" />
                        {usersPage.totalCount}
                    </Badge>
                )}
            </div>

            {selectedUserId !== null ? (
                <UserHistoryView
                    history={history ?? null}
                    status={historyStatus}
                    onBack={() => setSelectedUserId(null)}
                    l={l}
                />
            ) : (
                <UsersListView
                    usersPage={usersPage ?? null}
                    status={usersStatus}
                    page={page}
                    onPageChange={setPage}
                    onSelectUser={setSelectedUserId}
                    l={l}
                />
            )}
        </div>
    );
};

// ── Users list ─────────────────────────────────────────────────────────────────

const UsersListView = ({ usersPage, status, page, onPageChange, onSelectUser, l }: {
    usersPage: PagedResult<TelegramBotUserDto> | null;
    status: string;
    page: number;
    onPageChange: (p: number) => void;
    onSelectUser: (id: number) => void;
    l: Lang;
}) => {
    if (status === "pending") {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (!usersPage || usersPage.items.length === 0) {
        return (
            <Card className="border-dashed border-2">
                <CardContent className="p-16 flex flex-col items-center justify-center text-center gap-4">
                    <div className="p-4 bg-muted rounded-2xl">
                        <MessageSquare className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{t.noChats[l]}</h3>
                        <p className="text-muted-foreground mt-1 max-w-md">{t.noChatsDesc[l]}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {usersPage.items.map((user) => (
                    <UserRow key={user.telegramUserId} user={user} l={l} onClick={() => onSelectUser(user.telegramUserId)} />
                ))}
            </div>
            {usersPage.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted-foreground px-2">{page} / {usersPage.totalPages}</span>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === usersPage.totalPages}
                        className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

const UserRow = ({ user, l, onClick }: { user: TelegramBotUserDto; l: Lang; onClick: () => void }) => {
    const displayName = user.telegramUsername ? `@${user.telegramUsername}` : `#${user.telegramUserId}`;
    const initials = user.telegramUsername ? user.telegramUsername.slice(0, 2).toUpperCase() : "??";

    return (
        <button onClick={onClick} className="w-full group text-left">
            <Card className="border-0 bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-500 font-bold text-sm">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-foreground">{displayName}</span>
                            <p className="text-sm text-muted-foreground truncate mt-0.5 max-w-md">{user.lastMessage}</p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {new Date(user.lastActivityAt).toLocaleDateString()}
                            </div>
                            <Badge variant="secondary" className="text-xs gap-1">
                                <MessageSquare className="w-2.5 h-2.5" />
                                {user.totalMessages} {t.messages[l]}
                            </Badge>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </button>
    );
};

// ── User history view ──────────────────────────────────────────────────────────

const UserHistoryView = ({ history, status, onBack, l }: {
    history: TelegramUserHistoryDto | null;
    status: string;
    onBack: () => void;
    l: Lang;
}) => {
    if (status === "pending") {
        return (
            <div className="space-y-3">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
        );
    }

    if (!history) return null;

    const displayName = history.telegramUsername ? `@${history.telegramUsername}` : `#${history.telegramUserId}`;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    {t.back[l]}
                </button>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
                        {displayName.slice(1, 3).toUpperCase()}
                    </div>
                    <span className="font-semibold">{displayName}</span>
                    <span className="text-muted-foreground text-sm">· {history.messages.length} {t.messages[l]}</span>
                </div>
            </div>

            <Card className="border-0 bg-gradient-to-b from-muted/30 to-muted/10">
                <CardContent className="p-6">
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {history.messages.map((msg, i) => (
                            <MessageBubble key={i} msg={msg} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const MessageBubble = ({ msg }: { msg: TelegramSessionMessageDto }) => {
    const isUser = msg.role === "user";
    return (
        <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && (
                <div className="shrink-0 w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center mt-0.5">
                    <Bot className="w-4 h-4 text-blue-500" />
                </div>
            )}
            <div className={`max-w-[75%] space-y-1 flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isUser ? "bg-blue-500 text-white rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                }`}>
                    {msg.content}
                </div>
                <span className="text-xs text-muted-foreground px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {new Date(msg.createdAt).toLocaleDateString()}
                </span>
            </div>
            {isUser && (
                <div className="shrink-0 w-8 h-8 rounded-xl bg-muted flex items-center justify-center mt-0.5">
                    <User className="w-4 h-4 text-muted-foreground" />
                </div>
            )}
        </div>
    );
};

// ── Skeleton ───────────────────────────────────────────────────────────────────

const TelegramBotSkeleton = () => (
    <div className="container mx-auto py-8 space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-52 rounded-2xl col-span-2" />
            <Skeleton className="h-52 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
);

export default Page;