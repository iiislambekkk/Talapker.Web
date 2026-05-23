import { Bot, Sparkles, Sun, Moon, X, Settings, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import React, { memo, useRef, useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";

type Lang = "ru" | "kk" | "en";

interface ChatHeaderProps {
    institutionName: string;
    institutionLogoUrl: string | null;
    institutionFallback: string;
    cityName?: string;
    isLoading: boolean;
    theme: string | undefined;
    embedded: boolean;
    lang: Lang;
    onToggleTheme: () => void;
    onClose: () => void;
    onChangeLang: (lang: Lang) => void;
    onClearHistory: () => void;
    consultantLabel: string;
    clearHistoryLabel: string;
}

export const ChatHeader = memo(({
                                    institutionName,
                                    institutionLogoUrl,
                                    institutionFallback,
                                    cityName,
                                    isLoading,
                                    theme,
                                    embedded,
                                    lang,
                                    onToggleTheme,
                                    onClose,
                                    onChangeLang,
                                    onClearHistory,
                                    consultantLabel,
                                    clearHistoryLabel,
                                }: ChatHeaderProps) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">

                {/* Левая часть — логотип + текст */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isLoading ? (
                        <div className="w-9 h-9 rounded-full bg-primary/10 animate-pulse shrink-0" />
                    ) : institutionLogoUrl ? (
                        <Avatar className="w-9 h-9 border border-border shadow-sm shrink-0">
                            <AvatarImage src={institutionLogoUrl} alt={institutionName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                {institutionFallback}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="p-1.5 rounded-full bg-primary/10 shrink-0">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                    )}

                    <div className="min-w-0">
                        <CardTitle className="text-xs flex items-center gap-2 text-foreground leading-tight">
                            {isLoading ? (
                                <div className="h-4 w-32 bg-primary/10 rounded animate-pulse" />
                            ) : (
                                institutionName || consultantLabel
                            )}
                            <Badge variant="outline" className="text-xs border-border text-muted-foreground shrink-0">
                                <Sparkles className="w-3 h-3 mr-1" />AI
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            {isLoading ? (
                                <div className="h-3 w-20 bg-primary/10 rounded animate-pulse" />
                            ) : (
                                cityName ?? consultantLabel
                            )}
                        </CardDescription>
                    </div>
                </div>

                {/* Правая часть — кнопки + дропдаун */}
                <div className="flex items-center gap-1 shrink-0">

                    {/* Кнопка очистки истории */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={onClearHistory}
                        title={clearHistoryLabel}
                    >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>

                    {/* Кнопка настроек с дропдауном */}
                    <div className="relative" ref={dropdownRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-accent"
                            onClick={() => setOpen(v => !v)}
                        >
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>

                        {open && (
                            <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-border bg-card shadow-md p-1.5 flex flex-col gap-0.5">

                                {/* Язык */}
                                <div className="px-2 py-1.5">
                                    <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">
                                        Язык / Тіл / Lang
                                    </p>
                                    <div className="flex gap-1">
                                        {(["ru", "kk", "en"] as Lang[]).map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => { onChangeLang(l); setOpen(false); }}
                                                className={cn(
                                                    "flex-1 rounded-lg py-1 text-xs font-medium transition-colors",
                                                    lang === l
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-accent text-muted-foreground"
                                                )}
                                            >
                                                {l.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-border mx-1" />

                                {/* Тема */}
                                <button
                                    onClick={() => { onToggleTheme(); setOpen(false); }}
                                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-accent text-sm text-foreground transition-colors w-full text-left"
                                >
                                    {theme === "dark"
                                        ? <Sun className="h-4 w-4 text-muted-foreground shrink-0" />
                                        : <Moon className="h-4 w-4 text-muted-foreground shrink-0" />}
                                    {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Кнопка закрытия — только в embedded */}
                    {embedded && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={onClose}
                            title="Закрыть"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>

            </div>
        </CardHeader>
    );
});

ChatHeader.displayName = "ChatHeader";