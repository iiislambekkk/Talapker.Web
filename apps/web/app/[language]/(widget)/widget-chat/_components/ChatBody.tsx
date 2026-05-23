"use client";

import React, { useRef, useEffect, memo } from "react";
import {
    Bot, Loader2, AlertCircle,
    User, CheckCheck, ChevronDown,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import { useInView } from "react-intersection-observer";
import MessageContent from "@/components/MessageContent";
import { logger } from "@/lib/logger";
import { ChatWelcome } from "./ChatWelcome";

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

const BotAvatar = memo(({ logoUrl, name, fallback, size = "sm" }: BotAvatarProps) => {
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
});
BotAvatar.displayName = "BotAvatar";

interface MessageItemProps {
    msg: ChatMessage;
    lang: Lang;
    botLogoUrl: string | null;
    botName: string;
    botFallback: string;
    onSuggestionClick: (text: string) => void;
    onSuggestionPrefill: (text: string) => void;
}

const MessageItem = memo(({ msg, lang, botLogoUrl, botName, botFallback, onSuggestionClick, onSuggestionPrefill }: MessageItemProps) => (
        <div className={cn("flex", msg.isUser ? "justify-end" : "justify-start")}>
            <div className={cn("flex gap-2 max-w-[90%] xl:max-w-[80%]", msg.isUser ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                    "w-6 h-6 rounded-full shrink-0 flex items-center justify-center",
                    msg.isUser && "bg-primary/20"
                )}>
                    {msg.isUser
                        ? <User className="w-3 h-3 text-primary" />
                        : <BotAvatar logoUrl={botLogoUrl} name={botName} fallback={botFallback} />}
                </div>
                <div className="space-y-1">
                    <div className={cn(
                        "rounded-2xl px-3 py-2",
                        msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}>
                        <MessageContent
                            lang={lang}
                            content={msg.content}
                            isUser={msg.isUser}
                            isStreaming={false}
                            onSuggestionClick={msg.isUser ? undefined : onSuggestionClick}
                            onSuggestionPrefill={msg.isUser ? undefined : onSuggestionPrefill}
                        />
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
    ), (prev, next) =>
        prev.msg.id === next.msg.id &&
        prev.msg.content === next.msg.content &&
        prev.msg.timeAgo === next.msg.timeAgo &&
        prev.lang === next.lang &&
        prev.botLogoUrl === next.botLogoUrl &&
        prev.onSuggestionClick === next.onSuggestionClick &&
        prev.onSuggestionPrefill === next.onSuggestionPrefill
);
MessageItem.displayName = "MessageItem";

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
    poweredByLabel: string;
    onSuggestionClick: (message: string) => void;
    onSuggestionPrefill: (message: string) => void;
    labels: {
        loadingHistory: string;
        loadPrevious: string;
        typing: string;
        thinking: string;
    };
}

export const ChatMessages = memo(({
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
                                      poweredByLabel,
                                      onSuggestionClick,
                                      onSuggestionPrefill,
                                      labels,
                                  }: ChatMessagesProps) => {
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "200px",
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !isLoadingHistory) {
            logger.log("[ChatMessages] fetching next page");
            onBeforeFetchNextPage();
            onLoadMore();
        }
    }, [inView, hasNextPage, isFetchingNextPage, isLoadingHistory]);

    const isEmpty = messages.length === 0 && !isStreaming && !response && !isLoadingHistory;

    return (
        <div className="p-0 flex-1 overflow-hidden relative">
            <div ref={containerRef} onScroll={onScroll} className="h-full overflow-y-auto bg-background">
                <div className="p-4 space-y-4">

                    {isEmpty && (
                        <ChatWelcome
                            lang={lang}
                            institutionName={institutionName}
                            institutionLogoUrl={institutionLogoUrl}
                            institutionFallback={institutionFallback}
                            poweredByLabel={poweredByLabel}
                            onSuggestionClick={onSuggestionClick}
                        />
                    )}

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

                    {messages.map((msg) => (
                        <MessageItem
                            key={msg.id}
                            msg={msg}
                            lang={lang}
                            botLogoUrl={institutionLogoUrl}
                            botName={institutionName}
                            botFallback={institutionFallback}
                            onSuggestionClick={onSuggestionClick}
                            onSuggestionPrefill={onSuggestionPrefill}
                        />
                    ))}

                    {isStreaming && !response && (
                        <div className="flex justify-start">
                            <div className="flex gap-2 max-w-[80%]">
                                <BotAvatar
                                    logoUrl={institutionLogoUrl}
                                    name={institutionName}
                                    fallback={institutionFallback}
                                />
                                <div className="rounded-2xl px-3 py-2 bg-muted text-foreground flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{labels.thinking}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {response && (
                        <div className="flex justify-start">
                            <div className="flex gap-2 max-w-[80%]">
                                <BotAvatar
                                    logoUrl={institutionLogoUrl}
                                    name={institutionName}
                                    fallback={institutionFallback}
                                />
                                <div className="space-y-1">
                                    <div className="rounded-2xl px-3 py-2 bg-muted text-foreground">
                                        <MessageContent
                                            lang={lang}
                                            content={response}
                                            isUser={false}
                                            isStreaming={isStreaming}
                                            onSuggestionClick={onSuggestionClick}
                                            onSuggestionPrefill={onSuggestionPrefill}
                                        />
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
});
ChatMessages.displayName = "ChatMessages";