"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { env } from "@/lib/env";
import { useInfiniteQuery } from '@tanstack/react-query';

export interface StreamingChunk {
    content: string;
    isComplete: boolean;
    error?: string;
}

export interface ChatMessage {
    id: string;
    role: string;
    content: string;
    createdAt: string;
    toolCalls?: Record<string, any>;
    isUser: boolean;
    isAssistant: boolean;
    timeAgo: string;
}

export interface ChatHistoryResponse {
    messages: ChatMessage[];
    nextCursor: string | null;
    hasMore: boolean;
}

interface UseTalapkerChatProps {
    hubUrl?: string;
    userId?: string;
    institutionId: string;
}

const ANONYMOUS_ID_KEY = 'talapker_anonymous_id';

export const useTalapkerChat = ({
                                    hubUrl = `${env.NEXT_PUBLIC_BACKEND_URL}/talapkerHub`,
                                    userId: propUserId,
                                    institutionId,
                                }: UseTalapkerChatProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [response, setResponse] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [effectiveUserId, setEffectiveUserId] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

    const responseRef = useRef(response);
    const { data: session } = useSession();

    useEffect(() => {
        responseRef.current = response;
    }, [response]);

    useEffect(() => {
        if (propUserId) {
            setEffectiveUserId(propUserId);
            return;
        }

        if (session?.user?.sub) {
            setEffectiveUserId(session.user.sub);
            return;
        }

        const getOrCreateAnonymousId = () => {
            let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);
            if (!anonymousId) {
                anonymousId = uuidv4();
                localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
            }
            return anonymousId;
        };

        setEffectiveUserId(getOrCreateAnonymousId());
    }, [propUserId, session]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingHistory,
        error: historyError,
        refetch
    } = useInfiniteQuery({
        queryKey: ['chatHistory', effectiveUserId, institutionId],
        // @ts-ignore
        queryFn: async ({ pageParam = null }) => {
            if (!effectiveUserId || !institutionId) return { messages: [], nextCursor: null, hasMore: false };

            const params = new URLSearchParams();
            params.append('limit', '10');
            params.append('userId', effectiveUserId);
            params.append('institutionId', institutionId);

            if (pageParam) {
                params.append('cursor', pageParam);
                params.append('older', 'true');
            }

            const response = await fetch(
                `${env.NEXT_PUBLIC_BACKEND_URL}/api/chat/history?${params.toString()}`
            );

            if (!response.ok) throw new Error('Failed to fetch history');
            return response.json() as Promise<ChatHistoryResponse>;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore && lastPage.nextCursor) {
                return lastPage.nextCursor;
            }
            return undefined;
        },
        enabled: !!effectiveUserId && !!institutionId,
        initialPageParam: null,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (data) {
            // @ts-ignore
            const allMessages = data.pages.flatMap(page => page.messages);
            const uniqueMessages = Array.from(
                new Map(allMessages.map(msg => [msg.id, msg])).values()
            );
            const sortedMessages = uniqueMessages.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setMessages(sortedMessages);
        }
    }, [data]);

    useEffect(() => {
        if (!effectiveUserId) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                withCredentials: true,
                timeout: 30000
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.onreconnecting(() => setIsConnected(false));
        connection.onreconnected(() => setIsConnected(true));
        connection.onclose(() => setIsConnected(false));

        connection.start()
            .then(() => {
                setIsConnected(true);
                setError(null);
            })
            .catch(() => setError('Failed to connect to chat service'));

        setHubConnection(connection);

        return () => { connection.stop(); };
    }, [hubUrl, effectiveUserId]);

    useEffect(() => {
        if (!hubConnection) return;

        const handleReceiveChunk = (chunk: StreamingChunk) => {
            if (chunk.error) {
                setError(chunk.error);
                setIsStreaming(false);
                return;
            }

            if (chunk.isComplete) {
                setIsStreaming(false);

                const newMessage: ChatMessage = {
                    id: uuidv4(),
                    role: 'assistant',
                    content: responseRef.current,
                    createdAt: new Date().toISOString(),
                    isUser: false,
                    isAssistant: true,
                    timeAgo: 'только что'
                };

                setMessages(prev => [...prev, newMessage]);
                setResponse('');
                refetch();
            } else {
                setResponse(prev => prev + chunk.content);
            }
        };

        hubConnection.on('ReceiveChunk', handleReceiveChunk);
        return () => { hubConnection.off('ReceiveChunk', handleReceiveChunk); };
    }, [hubConnection, refetch]);

    const sendMessage = useCallback(async (message: string) => {
        if (!hubConnection || !isConnected) {
            setError('Not connected to chat service');
            return;
        }

        if (!effectiveUserId) {
            setError('User ID not available');
            return;
        }

        const userMessage: ChatMessage = {
            id: uuidv4(),
            role: 'user',
            content: message,
            createdAt: new Date().toISOString(),
            isUser: true,
            isAssistant: false,
            timeAgo: 'только что'
        };

        setMessages(prev => [...prev, userMessage]);
        setResponse('');
        setError(null);
        setIsStreaming(true);

        try {
            await hubConnection.invoke('AskStreaming', {
                message,
                userId: effectiveUserId,
                institutionId,
            });
        } catch (err) {
            setError('Failed to send message');
            setIsStreaming(false);
        }
    }, [hubConnection, isConnected, effectiveUserId, institutionId]);

    const clearHistory = useCallback(async () => {
        if (!effectiveUserId || !institutionId) return;

        const params = new URLSearchParams();
        params.append('userId', effectiveUserId);
        params.append('institutionId', institutionId);

        await fetch(
            `${env.NEXT_PUBLIC_BACKEND_URL}/api/talapker/history?${params.toString()}`,
            { method: 'DELETE' }
        );

        setMessages([]);
        setResponse('');
    }, [effectiveUserId, institutionId]);

    const resetAnonymousId = useCallback(() => {
        if (!session?.user?.sub && !propUserId) {
            localStorage.removeItem(ANONYMOUS_ID_KEY);
            const newId = uuidv4();
            localStorage.setItem(ANONYMOUS_ID_KEY, newId);
            setEffectiveUserId(newId);
        }
    }, [session, propUserId]);

    return {
        isConnected,
        isStreaming,
        response,
        error: error || (historyError ? (historyError as Error).message : null),
        effectiveUserId,
        sendMessage,
        resetAnonymousId,
        clearResponse: () => setResponse(''),
        clearHistory,
        messages,
        isLoadingHistory,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    };
};