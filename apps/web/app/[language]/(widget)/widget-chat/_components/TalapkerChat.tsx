/*
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    Send, Bot, Loader2, AlertCircle,
    Sparkles, X, Sun, Moon, User, CheckCheck, ChevronDown, ChevronRight, BookOpen,
} from "lucide-react";
import { useTalapkerChat } from '@/hooks/useTalapkerChat';
import { useTheme } from 'next-themes';
import { useInView } from 'react-intersection-observer';
import { cn } from "@workspace/ui/lib/utils";
import MessageContent from "@/components/MessageContent";
import { useQuery } from '@tanstack/react-query';
import {LocalizedText} from "@/Data/models/LocalizedText";
import {institutionForAdminQueryOptions} from "@/lib/tanstackQuery/options/institutionForAdminQueryOptions";
import {generateS3UrlFromKey} from "@/lib/generateS3UrlFromKey";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
    allFacultiesWithProgramsQueryOptions
} from "@/app/[language]/(widget)/widget-chat/_components/facultiesWithProgramsQueryOptions";


type Lang = 'ru' | 'kk' | 'en';

interface TalapkerChatWidgetProps {
    userId?: string;
    institutionId: string;
    className?: string;
    embedded?: boolean;
    lang?: Lang;
    onClose?: () => void;
}

const i18n = {
    consultant: {
        ru: 'Консультант университета',
        kk: 'Университет кеңесшісі',
        en: 'University consultant',
    },
    placeholder: {
        ru: 'Ваш вопрос...',
        kk: 'Сұрағыңыз...',
        en: 'Your question...',
    },
    ready: {
        ru: 'готов',
        kk: 'дайын',
        en: 'ready',
    },
    connecting: {
        ru: 'подключение...',
        kk: 'қосылуда...',
        en: 'connecting...',
    },
    loadingHistory: {
        ru: 'Загрузка истории...',
        kk: 'Тарихты жүктеу...',
        en: 'Loading history...',
    },
    loadPrevious: {
        ru: '↑ Загрузить предыдущие',
        kk: '↑ Алдыңғыларды жүктеу',
        en: '↑ Load previous',
    },
    typing: {
        ru: 'печатает...',
        kk: 'жазуда...',
        en: 'typing...',
    },
    poweredBy: {
        ru: 'Powered by GPT-4o',
        kk: 'GPT-4o негізінде',
        en: 'Powered by GPT-4o',
    },
    programs: {
        ru: 'Программы',
        kk: 'Бағдарламалар',
        en: 'Programs',
    },
    askAbout: {
        ru: 'Спросить о программе',
        kk: 'Бағдарлама туралы сұрау',
        en: 'Ask about program',
    },
    allPrograms: {
        ru: 'Все программы',
        kk: 'Барлық бағдарламалар',
        en: 'All programs',
    },
    faculties: {
        ru: 'Факультеты',
        kk: 'Факультеттер',
        en: 'Faculties',
    },
} as const;

export const TalapkerChatWidget = ({
                                       userId,
                                       institutionId,
                                       embedded = false,
                                       lang = 'ru',
                                       onClose,
                                   }: TalapkerChatWidgetProps) => {
    const [message, setMessage] = useState('');
    const [mounted, setMounted] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [prevMessagesLength, setPrevMessagesLength] = useState(0);
    const [userInitiatedScroll, setUserInitiatedScroll] = useState(false);
    const [isProgramsOpen, setIsProgramsOpen] = useState(false);
    const [openFaculties, setOpenFaculties] = useState<Record<string, boolean>>({});

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isInitialScrollDone = useRef(false);
    const prevScrollHeight = useRef(0);
    const isUserScrolling = useRef(false);
    // @ts-ignore
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();

    const { theme, setTheme } = useTheme();

    const tr = useCallback((key: keyof typeof i18n) => {
        const entry = i18n[key];
        if (typeof entry === 'object' && !Array.isArray(entry)) {
            return (entry as Record<Lang, string>)[lang] ?? (entry as Record<Lang, string>).ru;
        }
        return '';
    }, [lang]);

    const t = useCallback((text?: LocalizedText) => text?.[lang] ?? text?.ru ?? '', [lang]);

    const { data: institution, isLoading: isLoadingInstitution } = useQuery(
        institutionForAdminQueryOptions(institutionId)
    );

    const { data: facultiesWithPrograms, isLoading: isLoadingPrograms } = useQuery(
        allFacultiesWithProgramsQueryOptions(institutionId)
    );

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: '200px',
        root: chatContainerRef.current,
    });

    const {
        isConnected, isStreaming, response, error,
        sendMessage, effectiveUserId,
        messages, isLoadingHistory,
        fetchNextPage, hasNextPage, isFetchingNextPage,
    } = useTalapkerChat({ userId, institutionId });

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (!userInitiatedScroll) {
            chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior,
            });
        }
    }, [userInitiatedScroll]);

    const handleScroll = useCallback(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        isUserScrolling.current = true;
        setUserInitiatedScroll(true);

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            isUserScrolling.current = false;
        }, 150);

        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        const nearBottom = distanceFromBottom < 100;

        if (nearBottom) {
            setUserInitiatedScroll(false);
            setShouldAutoScroll(true);
        } else {
            setShouldAutoScroll(false);
        }

        setShowScrollButton(!nearBottom && messages.length > 0);
    }, [messages.length]);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY < 0) {
                setUserInitiatedScroll(true);
                setShouldAutoScroll(false);
            }
        };

        const handleTouchStart = () => {
            setUserInitiatedScroll(true);
            setShouldAutoScroll(false);
        };

        container.addEventListener('wheel', handleWheel, { passive: true });
        container.addEventListener('touchstart', handleTouchStart, { passive: true });

        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('touchstart', handleTouchStart);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isInitialScrollDone.current) return;
        if (isLoadingHistory) return;
        const timer = setTimeout(() => {
            scrollToBottom('auto');
            isInitialScrollDone.current = true;
        }, 100);
        return () => clearTimeout(timer);
    }, [isLoadingHistory, scrollToBottom]);

    useEffect(() => {
        if (!embedded) return;
        const handleMessage = (e: MessageEvent) => {
            if (e.data?.type === 'WIDGET_OPEN') {
                setUserInitiatedScroll(false);
                setTimeout(() => scrollToBottom('auto'), 50);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [embedded, scrollToBottom]);

    useEffect(() => {
        if (!isInitialScrollDone.current) return;
        if (!shouldAutoScroll || userInitiatedScroll) return;
        scrollToBottom('smooth');
    }, [response, messages.length, shouldAutoScroll, userInitiatedScroll, scrollToBottom]);

    useEffect(() => {
        if (isFetchingNextPage && chatContainerRef.current) {
            prevScrollHeight.current = chatContainerRef.current.scrollHeight;
        }
    }, [isFetchingNextPage]);

    useEffect(() => {
        if (!isInitialScrollDone.current) return;
        if (shouldAutoScroll) {
            setPrevMessagesLength(messages.length);
            return;
        }
        if (messages.length <= prevMessagesLength) return;
        const container = chatContainerRef.current;
        if (!container) return;
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - prevScrollHeight.current + container.scrollTop;
        });
        setPrevMessagesLength(messages.length);
    }, [messages.length, shouldAutoScroll, prevMessagesLength]);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !isLoadingHistory) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, isLoadingHistory, fetchNextPage]);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('theme');
        if (t === 'light' || t === 'dark') setTheme(t);
    }, []);

    useEffect(() => {
        if (embedded && mounted) {
            window.parent.postMessage({ type: 'WIDGET_READY', theme }, '*');
        }
    }, [embedded, mounted, theme]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleSend = async () => {
        if (!message.trim() || !isConnected || isStreaming) return;
        setUserInitiatedScroll(false);
        setShouldAutoScroll(true);
        const msg = message;
        setMessage('');
        await sendMessage(msg);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClose = () => {
        if (embedded) window.parent.postMessage({ type: 'WIDGET_CLOSE' }, '*');
        onClose?.();
    };

    const handleScrollButtonClick = () => {
        setUserInitiatedScroll(false);
        setShouldAutoScroll(true);
        setShowScrollButton(false);
        scrollToBottom('smooth');
    };

    const handleProgramClick = (programCode: string, programName: string) => {
        const question = lang === 'ru'
            ? `Расскажи про специальность ${programCode} - ${programName}`
            : lang === 'kk'
                ? `${programCode} - ${programName} мамандығы туралы айт`
                : `Tell me about specialty ${programCode} - ${programName}`;

        setMessage(question);
        setIsProgramsOpen(false);
    };

    const handleAllProgramsClick = () => {
        const question = lang === 'ru'
            ? 'Какие есть программы обучения?'
            : lang === 'kk'
                ? 'Қандай оқу бағдарламалары бар?'
                : 'What study programs are available?';

        setMessage(question);
        setIsProgramsOpen(false);
    };

    const toggleFaculty = (facultyId: string) => {
        setOpenFaculties(prev => ({
            ...prev,
            [facultyId]: !prev[facultyId]
        }));
    };

    const institutionLogoUrl = institution?.logoKey ? generateS3UrlFromKey(institution.logoKey) : null;
    const institutionName = t(institution?.name);
    const institutionFallback = institutionName?.[0] ?? 'U';

    const BotAvatar = () => (
        <div className="w-6 h-6 rounded-full shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center">
            {institutionLogoUrl ? (
                <Avatar className="w-6 h-6">
                    <AvatarImage src={institutionLogoUrl} alt={institutionName} />
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-semibold">
                        {institutionFallback}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <Bot className="w-3 h-3 text-primary" />
            )}
        </div>
    );

    if (!mounted) return <div className="w-full h-full bg-background" />;

    return (
        <div className="w-full h-full bg-background transition-colors duration-300">
            <Card className="w-full h-full border-0 rounded-none md:rounded-2xl flex flex-col bg-card gap-0">

                {/!* Header *!/}
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isLoadingInstitution ? (
                                <div className="w-9 h-9 rounded-full bg-primary/10 animate-pulse" />
                            ) : institutionLogoUrl ? (
                                <Avatar className="w-9 h-9 border border-border shadow-sm">
                                    <AvatarImage src={institutionLogoUrl} alt={institutionName} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                        {institutionFallback}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <div className="p-1.5 rounded-full bg-primary/10">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>
                            )}

                            <div>
                                <CardTitle className="text-base flex items-center gap-2 text-foreground leading-tight">
                                    {isLoadingInstitution ? (
                                        <div className="h-4 w-32 bg-primary/10 rounded animate-pulse" />
                                    ) : (
                                        institutionName || tr('consultant')
                                    )}
                                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                                        <Sparkles className="w-3 h-3 mr-1" />AI
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    {isLoadingInstitution ? (
                                        <div className="h-3 w-20 bg-primary/10 rounded animate-pulse" />
                                    ) : (
                                        institution?.city?.name ?? tr('consultant')
                                    )}
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                {theme === 'dark'
                                    ? <Sun className="h-4 w-4 text-muted-foreground" />
                                    : <Moon className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                            {embedded && (
                                <Button variant="ghost" size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-destructive/10"
                                        onClick={handleClose}>
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                {/!* Chat Area *!/}
                <CardContent className="p-0 flex-1 overflow-hidden relative">
                    <div
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        className="h-full overflow-y-auto bg-background"
                    >
                        <div className="p-4 space-y-4">
                            {hasNextPage && (
                                <div ref={loadMoreRef} className="flex justify-center py-2 min-h-[40px]">
                                    {isFetchingNextPage ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            <span className="text-xs text-muted-foreground">{tr('loadingHistory')}</span>
                                        </div>
                                    ) : (
                                        <span
                                            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                                            onClick={() => fetchNextPage()}>
                                            {tr('loadPrevious')}
                                        </span>
                                    )}
                                </div>
                            )}

                            {isLoadingHistory && (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div key={msg.id} className={cn("flex", msg.isUser ? "justify-end" : "justify-start")}>
                                    <div className={cn("flex gap-2 max-w-[80%]", msg.isUser ? "flex-row-reverse" : "flex-row")}>
                                        <div className={cn(
                                            "w-6 h-6 rounded-full shrink-0 flex items-center justify-center",
                                            msg.isUser ? "bg-primary/20" : ""
                                        )}>
                                            {msg.isUser
                                                ? <User className="w-3 h-3 text-primary" />
                                                : <BotAvatar />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className={cn(
                                                "rounded-2xl px-3 py-2",
                                                msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                            )}>
                                                <MessageContent content={msg.content} isUser={msg.isUser} />
                                            </div>
                                            <div className={cn(
                                                "flex items-center gap-1 text-[10px] text-muted-foreground",
                                                msg.isUser ? "justify-end" : "justify-start"
                                            )}>
                                                <span>{msg.timeAgo}</span>
                                                {msg.isUser && <CheckCheck className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {response && (
                                <div className="flex justify-start">
                                    <div className="flex gap-2 max-w-[80%]">
                                        <BotAvatar />
                                        <div className="space-y-1">
                                            <div className="rounded-2xl px-3 py-2 bg-muted text-foreground">
                                                <div className="relative">
                                                    <MessageContent content={response} isUser={false} />
                                                    {isStreaming && (
                                                        <span className="inline-block w-1 h-3 ml-0.5 bg-primary animate-pulse align-middle" />
                                                    )}
                                                </div>
                                            </div>
                                            {isStreaming && (
                                                <div className="text-[10px] text-muted-foreground">{tr('typing')}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                                    <p className="text-xs text-destructive">{error}</p>
                                </div>
                            )}

                            <div className="h-px" />
                        </div>
                    </div>

                    {showScrollButton && (
                        <Button
                            onClick={handleScrollButtonClick}
                            className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                            size="icon"
                        >
                            <ChevronDown className="h-5 w-5" />
                        </Button>
                    )}

                </CardContent>


                {/!* Programs Menu *!/}
                <div className="mt-2">
                    <Collapsible open={isProgramsOpen} onOpenChange={setIsProgramsOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{tr('programs')}</span>
                                </div>
                                <ChevronRight className={cn(
                                    "w-4 h-4 transition-transform",
                                    isProgramsOpen && "rotate-90"
                                )} />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
                            {isLoadingPrograms ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start gap-2 text-sm"
                                        onClick={handleAllProgramsClick}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        {tr('allPrograms')}
                                    </Button>

                                    {facultiesWithPrograms?.map((faculty) => (
                                        <div key={faculty.id} className="space-y-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-between gap-2 text-xs font-semibold text-muted-foreground"
                                                onClick={() => toggleFaculty(faculty.id)}
                                            >
                                                        <span className="truncate">
                                                            {faculty.name[lang] || faculty.name.ru}
                                                        </span>
                                                <ChevronRight className={cn(
                                                    "w-3 h-3 transition-transform shrink-0",
                                                    openFaculties[faculty.id] && "rotate-90"
                                                )} />
                                            </Button>

                                            {openFaculties[faculty.id] && (
                                                <div className="pl-2 space-y-1">
                                                    {faculty.educationPrograms.map((program) => (
                                                        <Button
                                                            key={program.id}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-start gap-2 text-xs pl-4"
                                                            onClick={() => handleProgramClick(program.code, program.name[lang] || program.name.ru)}
                                                        >
                                                            <span className="font-mono text-[10px] text-primary">{program.code}</span>
                                                            <span className="truncate">{program.name[lang] || program.name.ru}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/!* Input Area *!/}
                <div className="flex-shrink-0 border-t border-border">
                    <div className="p-3">
                        <div className="relative">
                            <Textarea
                                ref={textareaRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={tr('placeholder')}
                                className="min-h-[40px] max-h-[100px] pr-10 resize-none text-sm bg-background border-input text-foreground placeholder:text-muted-foreground"
                                disabled={!isConnected || isStreaming}
                            />
                            <Button size="icon" variant="ghost"
                                    className="absolute right-1 bottom-1 h-7 w-7 hover:bg-accent"
                                    onClick={handleSend}
                                    disabled={!message.trim() || !isConnected || isStreaming}>
                                {isStreaming
                                    ? <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                                    : <Send className="w-3 h-3 text-muted-foreground" />}
                            </Button>
                        </div>
                    </div>

                    <CardFooter className="bg-muted border-t border-border p-2">
                        <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] text-muted-foreground">{tr('poweredBy')}</span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className={cn("w-1 h-1 rounded-full",
                                    isConnected ? "bg-green-500 animate-ping" : "bg-muted-foreground")} />
                                {isConnected ? tr('ready') : tr('connecting')}
                            </span>
                        </div>
                    </CardFooter>

                    {process.env.NODE_ENV === 'development' && effectiveUserId && (
                        <div className="text-[10px] text-muted-foreground px-3 pb-2">
                            {effectiveUserId.substring(0, 8)}... | {institutionId.substring(0, 8)}...
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};*/
