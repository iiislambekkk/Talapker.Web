import React from "react";
import { Loader2, AlertCircle, User, CheckCheck, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import MessageContent from "@/components/MessageContent";
import { BotAvatar } from "./BotAvatar";

interface Message {
    id: string;
    isUser: boolean;
    content: string;
    timeAgo: string;
}

interface ChatMessagesProps {
    containerRef: React.RefObject<HTMLDivElement>;
    messages: Message[];
    response: string;
    isStreaming: boolean;
    error: string | null;
    isLoadingHistory: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    showScrollButton: boolean;
    loadMoreRef: (node?: Element | null) => void;
    onScroll: () => void;
    onScrollButtonClick: () => void;
    onLoadMore: () => void;
    institutionLogoUrl: string | null;
    institutionName: string;
    institutionFallback: string;
    loadingHistoryLabel: string;
    loadPreviousLabel: string;
    typingLabel: string;
    lang: "kk" | "ru" | "en";
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
                                 loadMoreRef,
                                 onScroll,
                                 onScrollButtonClick,
                                 onLoadMore,
                                 institutionLogoUrl,
                                 institutionName,
                                 institutionFallback,
                                 loadingHistoryLabel,
                                 loadPreviousLabel,
                                 typingLabel,
                                 lang
                             }: ChatMessagesProps) => {
    const botAvatarProps = {
        logoUrl: institutionLogoUrl,
        name: institutionName,
        fallback: institutionFallback,
    };

    return (
        <div className="p-0 flex-1 overflow-hidden relative">
            <div
                ref={containerRef}
                onScroll={onScroll}
                className="h-full overflow-y-auto bg-background"
            >
                <div className="p-4 space-y-4">
                    {/* Подгрузка старых сообщений */}
                    {hasNextPage && (
                        <div ref={loadMoreRef} className="flex justify-center py-2 min-h-[40px]">
                            {isFetchingNextPage ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground">{loadingHistoryLabel}</span>
                                </div>
                            ) : (
                                <span
                                    className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                                    onClick={onLoadMore}
                                >
                                    {loadPreviousLabel}
                                </span>
                            )}
                        </div>
                    )}

                    {isLoadingHistory && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Список сообщений */}
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex", msg.isUser ? "justify-end" : "justify-start")}>
                            <div className={cn("flex gap-2 max-w-[80%]", msg.isUser ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn(
                                    "w-6 h-6 rounded-full shrink-0 flex items-center justify-center",
                                    msg.isUser ? "bg-primary/20" : ""
                                )}>
                                    {msg.isUser
                                        ? <User className="w-3 h-3 text-primary" />
                                        : <BotAvatar {...botAvatarProps} />}
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

                    {/* Стриминг */}
                    {response && (
                        <div className="flex justify-start">
                            <div className="flex gap-2 max-w-[80%]">
                                <BotAvatar {...botAvatarProps} />
                                <div className="space-y-1">
                                    <div className="rounded-2xl px-3 py-2 bg-muted text-foreground">
                                        <div className="relative">
                                            <MessageContent lang={lang} content={response} isUser={false} />
                                            {isStreaming && (
                                                <span className="inline-block w-1 h-3 ml-0.5 bg-primary animate-pulse align-middle" />
                                            )}
                                        </div>
                                    </div>
                                    {isStreaming && (
                                        <div className="text-[10px] text-muted-foreground">{typingLabel}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ошибка */}
                    {error && (
                        <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                            <p className="text-xs text-destructive">{error}</p>
                        </div>
                    )}

                    <div className="h-px" />
                </div>
            </div>

            {/* Кнопка скролла вниз */}
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