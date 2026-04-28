import { Bot, Sparkles, Sun, Moon, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import React from "react";

interface ChatHeaderProps {
    institutionName: string;
    institutionLogoUrl: string | null;
    institutionFallback: string;
    cityName?: string;
    isLoading: boolean;
    theme: string | undefined;
    embedded: boolean;
    onToggleTheme: () => void;
    onClose: () => void;
    consultantLabel: string;
}

export const ChatHeader = ({
                               institutionName,
                               institutionLogoUrl,
                               institutionFallback,
                               cityName,
                               isLoading,
                               theme,
                               embedded,
                               onToggleTheme,
                               onClose,
                               consultantLabel,
                           }: ChatHeaderProps) => (
    <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {isLoading ? (
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
                        {isLoading ? (
                            <div className="h-4 w-32 bg-primary/10 rounded animate-pulse" />
                        ) : (
                            institutionName || consultantLabel
                        )}
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
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

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-accent"
                    onClick={onToggleTheme}
                >
                    {theme === 'dark'
                        ? <Sun className="h-4 w-4 text-muted-foreground" />
                        : <Moon className="h-4 w-4 text-muted-foreground" />}
                </Button>
                {embedded && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-destructive/10"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                )}
            </div>
        </div>
    </CardHeader>
);