import React, { memo } from "react";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

type Lang = "ru" | "kk" | "en";

interface Suggestion {
    icon: React.ReactNode;
    label: string;
    hint: string;
    message: string;
}

const suggestions: Record<Lang, Suggestion[]> = {
    ru: [
        {
            icon: <SchoolIcon />,
            label: "Какие есть специальности?",
            hint: "Программы бакалавриата и магистратуры",
            message: "Какие специальности есть в университете?",
        },
        {
            icon: <FileIcon />,
            label: "Как поступить?",
            hint: "Документы, сроки, требования",
            message: "Как поступить в университет? Какие нужны документы?",
        },
        {
            icon: <MapIcon />,
            label: "Общежитие",
            hint: "Инфраструктура, адреса, условия",
            message: "Расскажи про кампус и общежитие",
        },
    ],
    kk: [
        {
            icon: <SchoolIcon />,
            label: "Қандай мамандықтар бар?",
            hint: "Бакалавриат және магистратура бағдарламалары",
            message: "Университетте қандай мамандықтар бар?",
        },
        {
            icon: <FileIcon />,
            label: "Қалай түсуге болады?",
            hint: "Құжаттар, мерзімдер, талаптар",
            message: "Университетке қалай түсуге болады? Қандай құжаттар қажет?",
        },
        {
            icon: <MapIcon />,
            label: "Жатақхана",
            hint: "Инфрақұрылым, мекенжайлар, жағдайлар",
            message: "Кампус және жатақхана туралы айт",
        },
    ],
    en: [
        {
            icon: <SchoolIcon />,
            label: "What programs are available?",
            hint: "Bachelor's and Master's programs",
            message: "What study programs does the university offer?",
        },
        {
            icon: <FileIcon />,
            label: "How to apply?",
            hint: "Documents, deadlines, requirements",
            message: "How do I apply to the university? What documents are needed?",
        },
        {
            icon: <MapIcon />,
            label: "dormitory",
            hint: "Infrastructure, addresses, conditions",
            message: "Tell me about the campus and dormitory",
        },
    ],
};

const subtitles: Record<Lang, string> = {
    ru: "Спросите про поступление, программы, дедлайны или стоимость обучения",
    kk: "Қабылдау, бағдарламалар, мерзімдер немесе оқу құны туралы сұраңыз",
    en: "Ask about admissions, programs, deadlines, or tuition costs",
};

interface ChatWelcomeProps {
    lang: Lang;
    institutionName: string;
    institutionLogoUrl: string | null;
    institutionFallback: string;
    poweredByLabel: string;
    onSuggestionClick: (message: string) => void;
}

export const ChatWelcome = memo(({
                                     lang,
                                     institutionName,
                                     institutionLogoUrl,
                                     institutionFallback,
                                     poweredByLabel,
                                     onSuggestionClick,
                                 }: ChatWelcomeProps) => {
    const list = suggestions[lang] ?? suggestions.ru;

    return (
        <div className="flex flex-col items-center text-center px-5 py-8 gap-6">

            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                {institutionLogoUrl ? (
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={institutionLogoUrl} alt={institutionName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                            {institutionFallback}
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <Bot className="w-7 h-7 text-muted-foreground" />
                )}
            </div>

            {/* Title + subtitle */}
            <div className="space-y-1.5">
                <p className="text-base font-medium text-foreground leading-snug">
                    {institutionName || "AI-консультант"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">
                    {subtitles[lang]}
                </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-col gap-2 w-full max-w-[360px]">
                {list.map((s) => (
                    <button
                        key={s.message}
                        onClick={() => onSuggestionClick(s.message)}
                        className={cn(
                            "flex items-start gap-3 text-left px-3.5 py-2.5",
                            "bg-card border border-border rounded-xl",
                            "hover:bg-accent transition-colors duration-150",
                            "group"
                        )}
                    >
                        <span className="mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                            {s.icon}
                        </span>
                        <span className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-foreground leading-tight">
                                {s.label}
                            </span>
                            <span className="text-[11px] text-muted-foreground leading-tight">
                                {s.hint}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Divider + badge */}
            <div className="w-full max-w-[360px] border-t border-border" />

        </div>
    );
});

ChatWelcome.displayName = "ChatWelcome";

// Иконки через inline SVG чтобы не добавлять зависимости
function SchoolIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    );
}
function FileIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
    );
}
function CoinIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0 1 12 8c1.38 0 2.5.9 2.5 2s-1.12 2-2.5 2-2.5.9-2.5 2 1.12 2 2.5 2a2.5 2.5 0 0 0 2.5-1.5" />
        </svg>
    );
}
function MapIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
    );
}