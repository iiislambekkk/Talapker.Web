"use client";

import React, { useRef, useEffect } from "react";
import {
    Bot, Send, Loader2, AlertCircle,
    User, CheckCheck, ChevronDown, Mic, MicOff,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { CardFooter } from "@workspace/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import { useInView } from "react-intersection-observer";
import MessageContent from "@/components/MessageContent";
import { logger } from "@/lib/logger";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
    id: string;
    isUser: boolean;
    content: string;
    timeAgo: string;
}

type Lang = "ru" | "kk" | "en";

interface BotAvatarProps {
    logoUrl: string | null;
    name: string;
    fallback: string;
    size?: "sm" | "md";
}

// ─── BotAvatar ────────────────────────────────────────────────────────────────

const BotAvatar = ({ logoUrl, name, fallback, size = "sm" }: BotAvatarProps) => {
    const dim = size === "sm" ? "w-6 h-6" : "w-9 h-9";
    return (
        <div className={cn("rounded-full shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center", dim)}>
            {logoUrl ? (
                <Avatar className={dim}>
                    <AvatarImage src={logoUrl} alt={name} />
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-semibold">
                        {fallback}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <Bot className="w-3 h-3 text-primary" />
            )}
        </div>
    );
};

// ─── ChatMessages ─────────────────────────────────────────────────────────────

interface ChatMessagesProps {
    containerRef: React.RefObject<HTMLDivElement>;
    messages: ChatMessage[];
    response: string;
    isStreaming: boolean;
    error: string | null;
    isLoadingHistory: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    showScrollButton: boolean;
    onScroll: () => void;
    onScrollButtonClick: () => void;
    onLoadMore: () => void;
    onBeforeFetchNextPage: () => void;
    institutionLogoUrl: string | null;
    institutionName: string;
    institutionFallback: string;
    lang: Lang;
    labels: {
        loadingHistory: string;
        loadPrevious: string;
        typing: string;
    };
}

export const ChatMessages = ({
                                 containerRef,
                                 messages,
                                 response,
                                 isStreaming,
                                 error,
                                 isLoadingHistory,
                                 hasNextPage,
                                 isFetchingNextPage,
                                 showScrollButton,
                                 onScroll,
                                 onScrollButtonClick,
                                 onLoadMore,
                                 onBeforeFetchNextPage,
                                 institutionLogoUrl,
                                 institutionName,
                                 institutionFallback,
                                 lang,
                                 labels,
                             }: ChatMessagesProps) => {
    const botProps = { logoUrl: institutionLogoUrl, name: institutionName, fallback: institutionFallback };

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "200px",
        root: containerRef.current,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !isLoadingHistory) {
            logger.log("[ChatMessages] fetching next page");
            onBeforeFetchNextPage();
            onLoadMore();
        }
    }, [inView, hasNextPage, isFetchingNextPage, isLoadingHistory]);

    return (
        <div className="p-0 flex-1 overflow-hidden relative">
            <div ref={containerRef} onScroll={onScroll} className="h-full overflow-y-auto bg-background">
                <div className="p-4 space-y-4">

                    {/* Load more trigger */}
                    {hasNextPage && (
                        <div ref={loadMoreRef} className="flex justify-center py-2 min-h-[40px]">
                            {isFetchingNextPage ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground">{labels.loadingHistory}</span>
                                </div>
                            ) : (
                                <span
                                    className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                                    onClick={onLoadMore}
                                >
                                    {labels.loadPrevious}
                                </span>
                            )}
                        </div>
                    )}

                    {isLoadingHistory && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex", msg.isUser ? "justify-end" : "justify-start")}>
                            <div className={cn("flex gap-2 max-w-[80%]", msg.isUser ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn(
                                    "w-6 h-6 rounded-full shrink-0 flex items-center justify-center",
                                    msg.isUser && "bg-primary/20"
                                )}>
                                    {msg.isUser
                                        ? <User className="w-3 h-3 text-primary" />
                                        : <BotAvatar {...botProps} />}
                                </div>
                                <div className="space-y-1">
                                    <div className={cn(
                                        "rounded-2xl px-3 py-2",
                                        msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                    )}>
                                        <MessageContent lang={lang} content={msg.content} isUser={msg.isUser} />
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

                    {/* Streaming response */}
                    {response && (
                        <div className="flex justify-start">
                            <div className="flex gap-2 max-w-[80%]">
                                <BotAvatar {...botProps} />
                                <div className="space-y-1">
                                    <div className="rounded-2xl px-3 py-2 bg-muted text-foreground">
                                        <MessageContent lang={lang} content={response} isUser={false} />
                                        {isStreaming && (
                                            <span className="inline-block w-1 h-3 ml-0.5 bg-primary animate-pulse align-middle" />
                                        )}
                                    </div>
                                    {isStreaming && (
                                        <div className="text-[10px] text-muted-foreground">{labels.typing}</div>
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
                    onClick={onScrollButtonClick}
                    className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="icon"
                >
                    <ChevronDown className="h-5 w-5" />
                </Button>
            )}
        </div>
    );
};

// ─── useSpeechRecognition ─────────────────────────────────────────────────────

const langMap: Record<Lang, string> = {
    ru: "ru-RU",
    kk: "kk-KZ",
    en: "en-US",
};

function useSpeechRecognition(onChange: (value: string) => void, lang: Lang) {
    const [isListening, setIsListening] = React.useState(false);
    const recognitionRef = useRef<any>(null);

    const isSupported =
        typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    const toggle = () => {
        if (!isSupported) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition =
            (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = langMap[lang] ?? "ru-RU";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            logger.log("[SpeechRecognition] error", event.error, event);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onChange(transcript);
        };

        logger.log("[SpeechRecognition] starting, lang:", recognition.lang);
        recognition.start();
    };

    // Останавливаем при размонтировании
    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    return { isListening, isSupported, toggle };
}

// ─── ChatInput ────────────────────────────────────────────────────────────────

interface ChatInputProps {
    message: string;
    isConnected: boolean;
    isStreaming: boolean;
    placeholder: string;
    poweredByLabel: string;
    readyLabel: string;
    connectingLabel: string;
    onChange: (value: string) => void;
    onSend: () => void;
    effectiveUserId?: string;
    institutionId?: string;
    lang?: Lang;
}

export const ChatInput = ({
                              message,
                              isConnected,
                              isStreaming,
                              placeholder,
                              readyLabel,
                              connectingLabel,
                              onChange,
                              onSend,
                              effectiveUserId,
                              institutionId,
                              lang = "ru",
                          }: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { isListening, isSupported, toggle } = useSpeechRecognition(onChange, lang);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [message]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="flex-shrink-0 border-t border-border">
            <div className="p-3">
                <div className="relative">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={cn(
                            "min-h-[40px] max-h-[100px] resize-none text-sm",
                            isSupported ? "pr-16" : "pr-10"
                        )}
                        disabled={!isConnected || isStreaming}
                    />

                    {/* Кнопка микрофона */}
                    {isSupported && (
                        <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            className={cn(
                                "absolute right-8 bottom-1 h-7 w-7 hover:bg-accent transition-colors",
                                isListening && "text-red-500 hover:text-red-600"
                            )}
                            onClick={toggle}
                            disabled={isStreaming}
                        >
                            {isListening
                                ? <MicOff className="w-3 h-3" />
                                : <Mic className="w-3 h-3 text-muted-foreground" />}
                        </Button>
                    )}

                    {/* Кнопка отправки */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 bottom-1 h-7 w-7 hover:bg-accent"
                        onClick={onSend}
                        disabled={!message.trim() || !isConnected || isStreaming}
                    >
                        {isStreaming
                            ? <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                            : <Send className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                </div>
            </div>

            <CardFooter className="bg-muted border-t border-border p-2">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className={cn(
                        "w-1 h-1 rounded-full",
                        isConnected ? "bg-green-500 animate-ping" : "bg-muted-foreground"
                    )} />
                    {isConnected ? readyLabel : connectingLabel}
                </span>
            </CardFooter>

            {process.env.NODE_ENV === "development" && effectiveUserId && (
                <div className="text-[10px] text-muted-foreground px-3 pb-2">
                    {effectiveUserId.substring(0, 8)}... | {institutionId?.substring(0, 8)}...
                </div>
            )}
        </div>
    );
};