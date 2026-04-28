import { useRef, useState, useCallback, useEffect } from "react";

interface UseChatScrollOptions {
    messagesLength: number;
    isStreaming: boolean;
    isLoadingHistory: boolean;
    embedded?: boolean;
}

export const useChatScroll = ({
                                  messagesLength,
                                  isStreaming,
                                  isLoadingHistory,
                                  embedded,
                              }: UseChatScrollOptions) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);
    const prevScrollHeight = useRef(0);
    const isAtBottom = useRef(true);

    const [showScrollButton, setShowScrollButton] = useState(false);

    const getContainer = () => containerRef.current;

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        const el = getContainer();
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    }, []);

    const handleScroll = useCallback(() => {
        const el = getContainer();
        if (!el) return;
        const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
        isAtBottom.current = dist < 80;
        setShowScrollButton(!isAtBottom.current && messagesLength > 0);
    }, [messagesLength]);

    const handleScrollButtonClick = useCallback(() => {
        isAtBottom.current = true;
        setShowScrollButton(false);
        scrollToBottom("smooth");
    }, [scrollToBottom]);

    const onBeforeFetchNextPage = useCallback(() => {
        const el = getContainer();
        if (el) prevScrollHeight.current = el.scrollHeight;
    }, []);

    // Колесо мыши — пользователь скроллит вверх
    useEffect(() => {
        const el = getContainer();
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            if (e.deltaY < 0) isAtBottom.current = false;
        };
        el.addEventListener("wheel", onWheel, { passive: true });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    // Начальный скролл
    useEffect(() => {
        if (isInitialized.current || isLoadingHistory) return;
        const timer = setTimeout(() => {
            scrollToBottom("auto");
            isInitialized.current = true;
        }, 50);
        return () => clearTimeout(timer);
    }, [isLoadingHistory, scrollToBottom]);

    // Открытие виджета
    useEffect(() => {
        if (!embedded) return;
        const onMessage = (e: MessageEvent) => {
            if (e.data?.type === "WIDGET_OPEN") {
                isAtBottom.current = true;
                setTimeout(() => scrollToBottom("auto"), 50);
            }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [embedded, scrollToBottom]);

    // Стриминг — instant, без smooth чтобы не дёргало
    useEffect(() => {
        if (!isStreaming || !isAtBottom.current) return;
        scrollToBottom("instant" as ScrollBehavior);
    }, [isStreaming, scrollToBottom]);

    // Новое сообщение добавлено
    useEffect(() => {
        if (!isInitialized.current || !isAtBottom.current) return;
        scrollToBottom("smooth");
    }, [messagesLength, scrollToBottom]);

    // Восстановление позиции после подгрузки истории
    useEffect(() => {
        const el = getContainer();
        if (!el || !isInitialized.current || isAtBottom.current) return;
        requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight - prevScrollHeight.current + el.scrollTop;
        });
    }, [messagesLength]);

    return {
        containerRef,
        showScrollButton,
        handleScroll,
        handleScrollButtonClick,
        onBeforeFetchNextPage,
    };
};