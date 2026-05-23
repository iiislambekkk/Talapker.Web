"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@workspace/ui/components/card";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { logger } from "@/lib/logger";
import { MessageSquare, Brain } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

import { LocalizedText } from "@/Data/models/LocalizedText";
import { institutionForAdminQueryOptions } from "@/lib/tanstackQuery/options/institutionForAdminQueryOptions";
import { generateS3UrlFromKey } from "@/lib/generateS3UrlFromKey";
import { allFacultiesWithProgramsQueryOptions } from "./facultiesWithProgramsQueryOptions";
import { useTalapkerChat } from "@/hooks/useTalapkerChat";
import { useChatScroll } from "./useChatScroll";

import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatBody";
import { ChatInput } from "./ChatInput";
import { ProgramsMenu } from "./ProgramsMenu";
import { CareerTestTab } from "./CareerTestTab";

type Lang = "ru" | "kk" | "en";

interface TalapkerChatWidgetProps {
    userId?: string;
    institutionId: string;
    className?: string;
    embedded?: boolean;
    lang?: Lang;
    onClose?: () => void;
}

const i18n = {
    consultant:     { ru: "Консультант университета", kk: "Университет кеңесшісі",  en: "University consultant" },
    placeholder:    { ru: "Ваш вопрос...",            kk: "Сұрағыңыз...",           en: "Your question..." },
    ready:          { ru: "готов",                    kk: "дайын",                  en: "ready" },
    thinking:       { ru: "Думаю...",                 kk: "Ойлануда...",            en: "Thinking..." },
    connecting:     { ru: "подключение...",           kk: "қосылуда...",            en: "connecting..." },
    loadingHistory: { ru: "Загрузка истории...",      kk: "Тарихты жүктеу...",      en: "Loading history..." },
    loadPrevious:   { ru: "↑ Загрузить предыдущие",  kk: "↑ Алдыңғыларды жүктеу", en: "↑ Load previous" },
    typing:         { ru: "печатает...",              kk: "жазуда...",              en: "typing..." },
    poweredBy:      { ru: "Powered by GPT-4o",        kk: "GPT-4o негізінде",       en: "Powered by GPT-4o" },
    programs:       { ru: "Программы",                kk: "Бағдарламалар",          en: "Programs" },
    allPrograms:    { ru: "Все программы",            kk: "Барлық бағдарламалар",   en: "All programs" },
    chatTab:        { ru: "Чат",                      kk: "Чат",                    en: "Chat" },
    testTab:        { ru: "Тест",                     kk: "Тест",                   en: "Test" },
    clearHistory:   { ru: "Очистить чат",             kk: "Чатты тазалау",          en: "Clear chat" },
} as const;

export const TalapkerChatWidget = ({
                                       userId,
                                       institutionId,
                                       embedded = false,
                                       lang: initialLang = "ru",
                                       onClose,
                                   }: TalapkerChatWidgetProps) => {
    const [message, setMessage] = useState("");
    const [mounted, setMounted] = useState(false);
    const [lang, setLang] = useState<Lang>(initialLang);
    const [activeTab, setActiveTab] = useState<"chat" | "test">("chat");
    const { theme, setTheme } = useTheme();

    const tr = useCallback(
        (key: keyof typeof i18n) => (i18n[key] as Record<Lang, string>)[lang] ?? (i18n[key] as Record<Lang, string>).ru,
        [lang]
    );

    const t = useCallback(
        (text?: LocalizedText) => text?.[lang] ?? text?.ru ?? "",
        [lang]
    );

    const { data: institution, isLoading: isLoadingInstitution } = useQuery(
        institutionForAdminQueryOptions(institutionId)
    );
    const { data: facultiesWithPrograms, isLoading: isLoadingPrograms } = useQuery(
        allFacultiesWithProgramsQueryOptions(institutionId)
    );

    const {
        isConnected, isStreaming, response, error,
        sendMessage, effectiveUserId,
        messages, isLoadingHistory,
        fetchNextPage, hasNextPage, isFetchingNextPage,
        clearHistory,
    } = useTalapkerChat({ userId, institutionId });

    const {
        containerRef,
        showScrollButton,
        handleScroll,
        handleScrollButtonClick,
        onBeforeFetchNextPage,
    } = useChatScroll({
        messagesLength: messages.length,
        isStreaming,
        isLoadingHistory,
        embedded,
    });

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get("theme");
        if (t === "light" || t === "dark") setTheme(t);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const t = params.get("theme");
        if (t === "light" || t === "dark") setTheme(t);

        const redirectedQuestion = params.get("redirectedQuestion");
        if (redirectedQuestion) setMessage(decodeURIComponent(redirectedQuestion));
    }, []);

    useEffect(() => {
        if (embedded && mounted) {
            window.parent.postMessage({ type: "WIDGET_READY", theme }, "*");
        }
    }, [embedded, mounted, theme]);

    const institutionLogoUrl = useMemo(
        () => institution?.logoKey ? generateS3UrlFromKey(institution.logoKey) : null,
        [institution?.logoKey]
    );
    const institutionName = t(institution?.name);
    const institutionFallback = institutionName?.[0] ?? "U";

    const handleSend = useCallback(async () => {
        if (!message.trim() || !isConnected || isStreaming) return;
        const msg = message;
        setMessage("");
        logger.log("[TalapkerChatWidget] sending message");
        await sendMessage(msg);
    }, [message, isConnected, isStreaming, sendMessage]);

    // Suggestion sent immediately as a message
    const handleSuggestionClick = useCallback(async (msg: string) => {
        if (!isConnected || isStreaming) return;
        await sendMessage(msg);
    }, [isConnected, isStreaming, sendMessage]);

    // Suggestion only fills the input for editing
    const handleSuggestionPrefill = useCallback((msg: string) => {
        setMessage(msg);
        setActiveTab("chat");
    }, []);

    const handleProgramClick = useCallback((code: string, name: string) => {
        const q = lang === "ru"
            ? `Расскажи про специальность ${code} - ${name}`
            : lang === "kk"
                ? `${code} - ${name} мамандығы туралы айт`
                : `Tell me about specialty ${code} - ${name}`;
        setMessage(q);
    }, [lang]);

    const handleAllProgramsClick = useCallback(() => {
        const q = lang === "ru"
            ? "Какие есть программы обучения?"
            : lang === "kk"
                ? "Қандай оқу бағдарламалары бар?"
                : "What study programs are available?";
        setMessage(q);
    }, [lang]);

    const handleClose = useCallback(() => {
        if (embedded) window.parent.postMessage({ type: "WIDGET_CLOSE" }, "*");
        onClose?.();
    }, [embedded, onClose]);

    const handleToggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [theme, setTheme]);

    const handleGoToChat = useCallback((msg: string) => {
        setMessage(msg);
        setActiveTab("chat");
    }, []);

    const chatLabels = useMemo(() => ({
        loadingHistory: tr("loadingHistory"),
        loadPrevious: tr("loadPrevious"),
        typing: tr("typing"),
        thinking: tr("thinking"),
    }), [tr]);

    if (!mounted) return <div className="w-full h-full bg-background" />;

    return (
        <div className="w-full h-full bg-background transition-colors duration-300">
            <Card className="w-full h-full border-0 rounded-none md:rounded-2xl flex flex-col bg-card gap-0 pb-0 pt-0">

                <ChatHeader
                    institutionName={institutionName}
                    institutionLogoUrl={institutionLogoUrl}
                    institutionFallback={institutionFallback}
                    cityName={institution?.city?.name}
                    isLoading={isLoadingInstitution}
                    theme={theme}
                    embedded={embedded}
                    lang={lang}
                    onToggleTheme={handleToggleTheme}
                    onClose={handleClose}
                    onChangeLang={setLang}
                    onClearHistory={clearHistory}
                    consultantLabel={tr("consultant")}
                    clearHistoryLabel={tr("clearHistory")}
                />

                {/* ── Tab switcher ── */}
                <div className="flex border-b border-border bg-card shrink-0 px-4 pt-1">
                    {(["chat", "test"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                                activeTab === tab
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab === "chat" ? (
                                <>
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {tr("chatTab")}
                                </>
                            ) : (
                                <>
                                    <Brain className="w-3.5 h-3.5" />
                                    {tr("testTab")}
                                </>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Tab content ── */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {activeTab === "chat" ? (
                        <>
                            <ChatMessages
                                // @ts-ignore
                                containerRef={containerRef}
                                messages={messages}
                                response={response}
                                isStreaming={isStreaming}
                                error={error}
                                isLoadingHistory={isLoadingHistory}
                                hasNextPage={!!hasNextPage}
                                poweredByLabel={tr("poweredBy")}
                                onSuggestionClick={handleSuggestionClick}
                                onSuggestionPrefill={handleSuggestionPrefill}
                                isFetchingNextPage={isFetchingNextPage}
                                showScrollButton={showScrollButton}
                                onScroll={handleScroll}
                                onScrollButtonClick={handleScrollButtonClick}
                                onLoadMore={fetchNextPage}
                                onBeforeFetchNextPage={onBeforeFetchNextPage}
                                institutionLogoUrl={institutionLogoUrl}
                                institutionName={institutionName}
                                institutionFallback={institutionFallback}
                                lang={lang}
                                labels={chatLabels}
                            />

                            <ProgramsMenu
                                faculties={facultiesWithPrograms}
                                isLoading={isLoadingPrograms}
                                lang={lang}
                                onProgramClick={handleProgramClick}
                                onAllProgramsClick={handleAllProgramsClick}
                                programsLabel={tr("programs")}
                                allProgramsLabel={tr("allPrograms")}
                            />

                            <ChatInput
                                message={message}
                                isConnected={isConnected}
                                isStreaming={isStreaming}
                                placeholder={tr("placeholder")}
                                poweredByLabel={tr("poweredBy")}
                                readyLabel={tr("ready")}
                                connectingLabel={tr("connecting")}
                                onChange={setMessage}
                                onSend={handleSend}
                                effectiveUserId={effectiveUserId}
                                institutionId={institutionId}
                                lang={lang}
                            />
                        </>
                    ) : (
                        <CareerTestTab
                            lang={lang}
                            institutionId={institutionId}
                            onGoToChat={handleGoToChat}
                        />
                    )}
                </div>

            </Card>
        </div>
    );
};