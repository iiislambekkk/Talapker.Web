"use client";

import React, { useRef, useEffect, useCallback, memo } from "react";
import { Send, Loader2, Mic, MicOff, Square } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { logger } from "@/lib/logger";

type Lang = "ru" | "kk" | "en";

const langMap: Record<Lang, string> = {
    ru: "ru-RU",
    kk: "kk-KZ",
    en: "en-US",
};

function useSpeechRecognition(onChange: (value: string) => void, lang: Lang) {
    const [isListening, setIsListening] = React.useState(false);
    const recognitionRef = useRef<any>(null);

    const isSupported =
        typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    const toggle = () => {
        if (!isSupported) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SR =
            (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
        const recognition = new SR();
        recognitionRef.current = recognition;

        recognition.lang = langMap[lang] ?? "ru-RU";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            logger.log("[SpeechRecognition] error", event.error, event);
            setIsListening(false);
        };
        recognition.onresult = (event: any) => {
            onChange(event.results[0][0].transcript);
        };

        logger.log("[SpeechRecognition] starting, lang:", recognition.lang);
        recognition.start();
    };

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    return { isListening, isSupported, toggle };
}

interface ChatInputProps {
    message: string;
    isConnected: boolean;
    isStreaming: boolean;
    placeholder: string;
    poweredByLabel?: string;
    readyLabel: string;
    connectingLabel: string;
    onChange: (value: string) => void;
    onSend: () => void;
    effectiveUserId?: string;
    institutionId?: string;
    lang?: Lang;
}

export const ChatInput = memo(
    ({
         message,
         isConnected,
         isStreaming,
         placeholder,
         onChange,
         onSend,
         lang = "ru",
     }: ChatInputProps) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const { isListening, isSupported, toggle } = useSpeechRecognition(onChange, lang);

        /* Auto-resize textarea */
        const resizeTextarea = useCallback(() => {
            const el = textareaRef.current;
            if (!el) return;
            el.style.height = "auto";
            const next = Math.min(el.scrollHeight, 180); // max ~5 rows
            el.style.height = `${next}px`;
        }, []);

        useEffect(() => {
            resizeTextarea();
        }, [message, resizeTextarea]);

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
            }
        };

        const canSend = !!message.trim() && isConnected && !isStreaming;
        const disabled = !isConnected || isStreaming;

        return (
            <div className="chat-input-root">
                {/* Mic pulse ring when listening */}
                {isListening && <div className="mic-ring" />}

                <div className="chat-input-inner">
                    {/* Mic button – left side */}
                    {isSupported && (
                        <button
                            type="button"
                            className={cn("icon-btn mic-btn", isListening && "mic-active")}
                            onClick={toggle}
                            disabled={isStreaming}
                            aria-label={isListening ? "Остановить запись" : "Голосовой ввод"}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                    )}

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        rows={1}
                        disabled={disabled}
                        className="chat-textarea bg-secondary p-2 rounded-sm"
                        aria-label="Сообщение"
                    />

                    {/* Send / Stop button – right side */}
                    <button
                        type="button"
                        className={cn("icon-btn send-btn", canSend && "send-active")}
                        onClick={onSend}
                        disabled={!canSend && !isStreaming}
                        aria-label="Отправить"
                    >
                        {isStreaming ? (
                            <Loader2 size={20} className="spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>

                {/* Hint */}
                <p className="chat-hint">
                    Enter — отправить&nbsp;&nbsp;·&nbsp;&nbsp;Shift + Enter — новая строка
                </p>

                <style>{`
                    /* ── Root ─────────────────────────────────────────────── */
                    .chat-input-root {
                        position: relative;
                        padding: 10px 12px 6px;
                        border-top: 1px solid hsl(var(--border));
                        background: hsl(var(--background));
                    }

                    /* ── Row ──────────────────────────────────────────────── */
                    .chat-input-inner {
                        display: flex;
                        align-items: flex-end;
                        gap: 6px;
                        background: hsl(var(--muted));
                        border: 1.5px solid hsl(var(--border));
                        border-radius: 16px;
                        padding: 6px 6px 6px 8px;
                        transition: border-color 0.15s;
                    }
                    .chat-input-inner:focus-within {
                        border-color: hsl(var(--ring, var(--primary)));
                        background: hsl(var(--background));
                    }

                    /* ── Textarea ─────────────────────────────────────────── */
                    .chat-textarea {
                        flex: 1;
                        resize: none;
                        border: none;
                        outline: none;
                      
                        color: hsl(var(--foreground));
                        font-size: 15px;
                        line-height: 1.55;
                        min-height: 36px;    /* ~1 row */
                        max-height: 180px;   /* ~5 rows */
                        overflow-y: auto;
                        scrollbar-width: thin;
                    }
                    .chat-textarea::placeholder {
                        color: hsl(var(--muted-foreground));
                    }
                    .chat-textarea:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }

                    /* ── Icon buttons ─────────────────────────────────────── */
                    .icon-btn {
                        flex-shrink: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        /* Touch-friendly: min 44×44 */
                        width: 44px;
                        height: 44px;
                        border-radius: 12px;
                        border: none;
                        background: transparent;
                        color: hsl(var(--muted-foreground));
                        cursor: pointer;
                        transition: background 0.15s, color 0.15s, transform 0.1s;
                        -webkit-tap-highlight-color: transparent;
                    }
                    .icon-btn:disabled {
                        opacity: 0.35;
                        cursor: not-allowed;
                    }
                    .icon-btn:not(:disabled):hover {
                        background: hsl(var(--accent));
                        color: hsl(var(--accent-foreground));
                    }
                    .icon-btn:not(:disabled):active {
                        transform: scale(0.92);
                    }

                    /* Mic active state */
                    .mic-active {
                        color: #ef4444 !important;
                        background: #fee2e2 !important;
                    }
                    @media (prefers-color-scheme: dark) {
                        .mic-active {
                            background: rgba(239,68,68,0.18) !important;
                        }
                    }

                    /* Send active state */
                    .send-active {
                        background: hsl(var(--primary)) !important;
                        color: hsl(var(--primary-foreground)) !important;
                    }
                    .send-active:hover {
                        opacity: 0.88;
                    }

                    /* Mic pulse ring */
                    .mic-ring {
                        position: absolute;
                        top: 10px; right: 12px;
                        width: 44px; height: 44px;
                        border-radius: 50%;
                        border: 2px solid #ef4444;
                        opacity: 0;
                        animation: mic-pulse 1.4s ease-out infinite;
                        pointer-events: none;
                    }
                    @keyframes mic-pulse {
                        0%   { transform: scale(0.9); opacity: 0.6; }
                        70%  { transform: scale(1.4); opacity: 0; }
                        100% { opacity: 0; }
                    }

                    /* Spinner */
                    .spin { animation: spin 0.9s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }

                    /* ── Hint ─────────────────────────────────────────────── */
                    .chat-hint {
                        margin: 5px 4px 0;
                        font-size: 11px;
                        line-height: 1.4;
                        color: hsl(var(--muted-foreground));
                        opacity: 0.7;
                        user-select: none;
                    }

                    /* ── Mobile overrides ─────────────────────────────────── */
                    @media (max-width: 480px) {
                        .chat-hint { display: none; }
                        .chat-input-root { padding: 8px 8px 8px; }
                        .chat-textarea { font-size: 16px; /* prevent iOS zoom */ }
                    }
                `}</style>
            </div>
        );
    }
);

ChatInput.displayName = "ChatInput";