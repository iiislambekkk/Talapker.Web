import { Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";

interface BotAvatarProps {
    logoUrl: string | null;
    name: string;
    fallback: string;
}

export const BotAvatar = ({ logoUrl, name, fallback }: BotAvatarProps) => (
    <div className="w-6 h-6 rounded-full shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center">
        {logoUrl ? (
            <Avatar className="w-6 h-6">
                <AvatarImage src={logoUrl} alt={name} />
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-semibold">
                    {fallback}
                </AvatarFallback>
            </Avatar>
        ) : (
            <Bot className="w-3 h-3 text-primary" />
        )}
    </div>
);