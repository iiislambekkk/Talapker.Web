import { useRef, useState, useCallback, useEffect } from "react";

interface UseChatScrollOptions {
    messagesLength: number;
    response: string;
    isLoadingHistory: boolean;
    embedded?: boolean;
}

export const useChatScroll = ({
                                  messagesLength,
                                  response,
                                  isLoadingHistory,
                                  embedded,
                              }: UseChatScrollOptions) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isInitialScrollDone = useRef(false);
    const prevScrollHeight = useRef(0);
    const isUserScrolling = useRef(false);
    // @ts-ignore
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();

    const [showScrollButton, setShowScrollButton] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [userInitiatedScroll, setUserInitiatedScroll] = useState(false);
    const [prevMessagesLength, setPrevMessagesLength] = useState(0);

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

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
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

        setShowScrollButton(!nearBottom && messagesLength > 0);
    }, [messagesLength]);

    const handleScrollButtonClick = () => {
        setUserInitiatedScroll(false);
        setShouldAutoScroll(true);
        setShowScrollButton(false);
        scrollToBottom('smooth');
    };

    // Mouse wheel / touch — сбрасываем автоскролл
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
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, []);

    // Начальный скролл вниз после загрузки истории
    useEffect(() => {
        if (isInitialScrollDone.current || isLoadingHistory) return;
        const timer = setTimeout(() => {
            scrollToBottom('auto');
            isInitialScrollDone.current = true;
        }, 100);
        return () => clearTimeout(timer);
    }, [isLoadingHistory, scrollToBottom]);

    // Открытие виджета — скролл вниз
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

    // Автоскролл при новых сообщениях / стриминге
    useEffect(() => {
        if (!isInitialScrollDone.current || !shouldAutoScroll || userInitiatedScroll) return;
        scrollToBottom('smooth');
    }, [response, messagesLength, shouldAutoScroll, userInitiatedScroll, scrollToBottom]);

    // Сохранение высоты перед подгрузкой старых сообщений
    const onBeforeFetchNextPage = useCallback(() => {
        if (chatContainerRef.current) {
            prevScrollHeight.current = chatContainerRef.current.scrollHeight;
        }
    }, []);

    // Восстановление позиции скролла после подгрузки
    useEffect(() => {
        if (!isInitialScrollDone.current) return;
        if (shouldAutoScroll) {
            setPrevMessagesLength(messagesLength);
            return;
        }
        if (messagesLength <= prevMessagesLength) return;
        const container = chatContainerRef.current;
        if (!container) return;
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - prevScrollHeight.current + container.scrollTop;
        });
        setPrevMessagesLength(messagesLength);
    }, [messagesLength, shouldAutoScroll, prevMessagesLength]);

    return {
        chatContainerRef,
        showScrollButton,
        handleScroll,
        handleScrollButtonClick,
        onBeforeFetchNextPage,
    };
};