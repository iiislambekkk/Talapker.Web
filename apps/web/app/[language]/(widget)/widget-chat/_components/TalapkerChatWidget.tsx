"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@workspace/ui/components/card";
import { useTheme } from 'next-themes';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';

import { LocalizedText } from "@/Data/models/LocalizedText";
import { institutionForAdminQueryOptions } from "@/lib/tanstackQuery/options/institutionForAdminQueryOptions";
import { generateS3UrlFromKey } from "@/lib/generateS3UrlFromKey";
import { allFacultiesWithProgramsQueryOptions } from "@/app/[language]/(widget)/widget-chat/_components/facultiesWithProgramsQueryOptions";
import { useTalapkerChat } from '@/hooks/useTalapkerChat';

import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ProgramsMenu } from './ProgramsMenu';
import { ChatInput } from './ChatInput';
import {useChatScroll} from "@/app/[language]/(widget)/widget-chat/_components/useChatScroll";

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
    consultant:   { ru: 'Консультант университета', kk: 'Университет кеңесшісі',   en: 'University consultant' },
    placeholder:  { ru: 'Ваш вопрос...',             kk: 'Сұрағыңыз...',            en: 'Your question...' },
    ready:        { ru: 'готов',                      kk: 'дайын',                   en: 'ready' },
    connecting:   { ru: 'подключение...',             kk: 'қосылуда...',             en: 'connecting...' },
    loadingHistory: { ru: 'Загрузка истории...',      kk: 'Тарихты жүктеу...',       en: 'Loading history...' },
    loadPrevious: { ru: '↑ Загрузить предыдущие',    kk: '↑ Алдыңғыларды жүктеу',  en: '↑ Load previous' },
    typing:       { ru: 'печатает...',                kk: 'жазуда...',               en: 'typing...' },
    poweredBy:    { ru: 'Powered by GPT-4o',          kk: 'GPT-4o негізінде',        en: 'Powered by GPT-4o' },
    programs:     { ru: 'Программы',                  kk: 'Бағдарламалар',           en: 'Programs' },
    allPrograms:  { ru: 'Все программы',              kk: 'Барлық бағдарламалар',    en: 'All programs' },
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
    const { theme, setTheme } = useTheme();

    const tr = useCallback((key: keyof typeof i18n) => {
        const entry = i18n[key];
        return (entry as Record<Lang, string>)[lang] ?? (entry as Record<Lang, string>).ru;
    }, [lang]);

    const t = useCallback((text?: LocalizedText) => text?.[lang] ?? text?.ru ?? '', [lang]);

    // Данные
    const { data: institution, isLoading: isLoadingInstitution } = useQuery(
        institutionForAdminQueryOptions(institutionId)
    );
    const { data: facultiesWithPrograms, isLoading: isLoadingPrograms } = useQuery(
        allFacultiesWithProgramsQueryOptions(institutionId)
    );

    // Чат
    const {
        isConnected, isStreaming, response, error,
        sendMessage, effectiveUserId,
        messages, isLoadingHistory,
        fetchNextPage, hasNextPage, isFetchingNextPage,
    } = useTalapkerChat({ userId, institutionId });

    // Скролл
    const {
        chatContainerRef,
        showScrollButton,
        handleScroll,
        handleScrollButtonClick,
        onBeforeFetchNextPage,
    } = useChatScroll({
        messagesLength: messages.length,
        response,
        isLoadingHistory,
        embedded,
    });

    // Intersection observer для подгрузки истории
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: '200px',
        root: chatContainerRef.current,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !isLoadingHistory) {
            onBeforeFetchNextPage();
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, isLoadingHistory, fetchNextPage, onBeforeFetchNextPage]);

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

    // Инфо об учреждении
    const institutionLogoUrl = institution?.logoKey ? generateS3UrlFromKey(institution.logoKey) : null;
    const institutionName = t(institution?.name);
    const institutionFallback = institutionName?.[0] ?? 'U';

    // Отправка
    const handleSend = async () => {
        if (!message.trim() || !isConnected || isStreaming) return;
        const msg = message;
        setMessage('');
        await sendMessage(msg);
    };

    // Клик по программе
    const handleProgramClick = (code: string, name: string) => {
        const q = lang === 'ru'
            ? `Расскажи про специальность ${code} - ${name}`
            : lang === 'kk'
                ? `${code} - ${name} мамандығы туралы айт`
                : `Tell me about specialty ${code} - ${name}`;
        setMessage(q);
    };

    const handleAllProgramsClick = () => {
        const q = lang === 'ru'
            ? 'Какие есть программы обучения?'
            : lang === 'kk'
                ? 'Қандай оқу бағдарламалары бар?'
                : 'What study programs are available?';
        setMessage(q);
    };

    const handleClose = () => {
        if (embedded) window.parent.postMessage({ type: 'WIDGET_CLOSE' }, '*');
        onClose?.();
    };

    if (!mounted) return <div className="w-full h-full bg-background" />;

    return (
        <div className="w-full h-full bg-background transition-colors duration-300">
            <Card className="w-full h-full border-0 rounded-none md:rounded-2xl flex flex-col bg-card gap-0">

                <ChatHeader
                    institutionName={institutionName}
                    institutionLogoUrl={institutionLogoUrl}
                    institutionFallback={institutionFallback}
                    cityName={institution?.city?.name}
                    isLoading={isLoadingInstitution}
                    theme={theme}
                    embedded={embedded}
                    onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    onClose={handleClose}
                    consultantLabel={tr('consultant')}
                />

                <ChatMessages
                    // @ts-ignore
                    containerRef={chatContainerRef}
                    messages={messages}
                    response={response}
                    isStreaming={isStreaming}
                    error={error}
                    isLoadingHistory={isLoadingHistory}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    showScrollButton={showScrollButton}
                    loadMoreRef={loadMoreRef}
                    onScroll={handleScroll}
                    onScrollButtonClick={handleScrollButtonClick}
                    onLoadMore={fetchNextPage}
                    institutionLogoUrl={institutionLogoUrl}
                    institutionName={institutionName}
                    institutionFallback={institutionFallback}
                    loadingHistoryLabel={tr('loadingHistory')}
                    loadPreviousLabel={tr('loadPrevious')}
                    lang={lang}
                    typingLabel={tr('typing')}
                />

                <ProgramsMenu
                    faculties={facultiesWithPrograms}
                    isLoading={isLoadingPrograms}
                    lang={lang}
                    onProgramClick={handleProgramClick}
                    onAllProgramsClick={handleAllProgramsClick}
                    programsLabel={tr('programs')}
                    allProgramsLabel={tr('allPrograms')}
                />

                <ChatInput
                    message={message}
                    isConnected={isConnected}
                    isStreaming={isStreaming}
                    placeholder={tr('placeholder')}
                    poweredByLabel={tr('poweredBy')}
                    readyLabel={tr('ready')}
                    connectingLabel={tr('connecting')}
                    onChange={setMessage}
                    onSend={handleSend}
                    effectiveUserId={effectiveUserId}
                    institutionId={institutionId}
                />

            </Card>
        </div>
    );
};