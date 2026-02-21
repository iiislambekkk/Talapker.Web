import { useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { CardFooter } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

interface ChatInputProps {
    message: string;
    isConnected: boolean;
    isStreaming: boolean;
    placeholder: string;
    poweredByLabel: string;
    readyLabel: string;
    connectingLabel: string;
    onChange: (value: string) => void;
    onSend: () => void;
    // dev info
    effectiveUserId?: string;
    institutionId?: string;
}

export const ChatInput = ({
                              message,
                              isConnected,
                              isStreaming,
                              placeholder,
                              poweredByLabel,
                              readyLabel,
                              connectingLabel,
                              onChange,
                              onSend,
                              effectiveUserId,
                              institutionId,
                          }: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Авторесайз textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="flex-shrink-0 border-t border-border">
            <div className="p-3">
                <div className="relative">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="min-h-[40px] max-h-[100px] pr-10 resize-none text-sm bg-background border-input text-foreground placeholder:text-muted-foreground"
                        disabled={!isConnected || isStreaming}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 bottom-1 h-7 w-7 hover:bg-accent"
                        onClick={onSend}
                        disabled={!message.trim() || !isConnected || isStreaming}
                    >
                        {isStreaming
                            ? <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                            : <Send className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                </div>
            </div>

            <CardFooter className="bg-muted border-t border-border p-2">
                <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] text-muted-foreground">{poweredByLabel}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className={cn(
                            "w-1 h-1 rounded-full",
                            isConnected ? "bg-green-500 animate-ping" : "bg-muted-foreground"
                        )} />
                        {isConnected ? readyLabel : connectingLabel}
                    </span>
                </div>
            </CardFooter>

            {process.env.NODE_ENV === 'development' && effectiveUserId && (
                <div className="text-[10px] text-muted-foreground px-3 pb-2">
                    {effectiveUserId.substring(0, 8)}... | {institutionId?.substring(0, 8)}...
                </div>
            )}
        </div>
    );
};