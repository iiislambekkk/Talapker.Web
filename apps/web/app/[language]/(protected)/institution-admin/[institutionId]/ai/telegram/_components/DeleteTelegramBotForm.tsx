"use client";

import React, { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Loader2, Unplug } from "lucide-react";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/tanstackQuery/getQueryClient";
import { useLang } from "@/hooks/useLang";
import { logger } from "@/lib/logger";

type Lang = "ru" | "kk" | "en";

const t = {
    trigger:    { ru: "Отключить бота",              kk: "Ботты өшіру",               en: "Disconnect Bot"                 },
    title:      { ru: "Отключить Telegram бота?",    kk: "Telegram ботын өшіру?",      en: "Disconnect Telegram Bot?"       },
    description:{ ru: "Бот будет отключён и перестанет отвечать на сообщения. Вы сможете подключить его снова позже.", kk: "Бот өшіріліп, хабарламаларға жауап беруді тоқтатады. Оны кейінірек қайта қосуға болады.", en: "The bot will be disconnected and stop responding to messages. You can reconnect it later." },
    cancel:     { ru: "Отмена",                      kk: "Болдырмау",                  en: "Cancel"                         },
    confirm:    { ru: "Отключить",                   kk: "Өшіру",                      en: "Disconnect"                     },
    confirming: { ru: "Отключение...",               kk: "Өшірілуде...",               en: "Disconnecting..."               },
    success:    { ru: "Бот успешно отключён.",        kk: "Бот сәтті өшірілді.",         en: "Bot disconnected successfully." },
} as const;

interface DeleteTelegramBotFormProps {
    botId: string;
    institutionId: string;
}

export const DeleteTelegramBotForm = ({ botId, institutionId }: DeleteTelegramBotFormProps) => {
    const [isPending, startPending] = useTransition();
    const [open, setOpen] = React.useState(false);
    const { data: session } = useSession();
    const queryClient = getQueryClient();
    const [lang] = useLang();
    const l: Lang = (lang as Lang) in t.trigger ? (lang as Lang) : "en";

    const handleDelete = () => {
        const apiCall = async () => {
            try {
                logger.log("[DeleteTelegramBot] Removing bot:", botId);

                const api = createApi(session?.accessToken);
                await api.delete(`/api/telegram/${botId}`, {
                    params: { institutionId }
                });

                logger.log("[DeleteTelegramBot] Success");
                toast.success(t.success[l]);
                setOpen(false);
                await queryClient.invalidateQueries({ queryKey: ['telegram-bot', institutionId] });
            } catch (error: any) {
                logger.error("[DeleteTelegramBot] Error:", error);
            }
        };
        startPending(apiCall);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Unplug className="size-4 mr-2" />
                    {t.trigger[l]}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t.title[l]}</AlertDialogTitle>
                    <AlertDialogDescription>{t.description[l]}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{t.cancel[l]}</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    {t.confirming[l]}
                                </>
                            ) : (
                                t.confirm[l]
                            )}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteTelegramBotForm;