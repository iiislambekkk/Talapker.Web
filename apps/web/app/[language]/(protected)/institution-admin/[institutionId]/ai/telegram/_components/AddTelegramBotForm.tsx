"use client";

import React, { useTransition } from 'react';
import { Button } from "@workspace/ui/components/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DrawerForm } from "@/components/DrawerForm";
import { Field, FieldLabel, FieldError, FieldGroup } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/tanstackQuery/getQueryClient";
import { useLang } from "@/hooks/useLang";
import { logger } from "@/lib/logger";
import { Bot } from "lucide-react";

type Lang = "ru" | "kk" | "en";

const t = {
    trigger:          { ru: "Подключить бота",          kk: "Бот қосу",                en: "Connect Bot"                 },
    title:            { ru: "Подключить Telegram бота", kk: "Telegram ботын қосу",     en: "Connect Telegram Bot"        },
    description:      { ru: "Введите токен вашего Telegram бота. Его можно получить у @BotFather.", kk: "Telegram бот токенін енгізіңіз. Оны @BotFather-дан алуға болады.", en: "Enter your Telegram bot token. You can get it from @BotFather." },
    tokenLabel:       { ru: "Токен бота",               kk: "Бот токені",              en: "Bot Token"                   },
    tokenPlaceholder: { ru: "1234567890:AAF...",         kk: "1234567890:AAF...",       en: "1234567890:AAF..."           },
    cancel:           { ru: "Отмена",                   kk: "Болдырмау",               en: "Cancel"                      },
    submit:           { ru: "Подключить",               kk: "Қосу",                    en: "Connect"                     },
    submitting:       { ru: "Подключение...",            kk: "Қосылуда...",             en: "Connecting..."               },
    success:          { ru: "Бот успешно подключён!",   kk: "Бот сәтті қосылды!",      en: "Bot connected successfully!" },
} as const;

const addBotSchema = z.object({
    botToken: z.string().min(1, "Token is required").regex(/^\d+:[\w-]+$/, "Invalid bot token format"),
});

type AddBotFormData = z.infer<typeof addBotSchema>;

export const AddTelegramBotForm = ({ institutionId }: { institutionId: string }) => {
    const [isPending, startPending] = useTransition();
    const { data: session } = useSession();
    const queryClient = getQueryClient();
    const [open, setOpen] = React.useState(false);
    const [lang] = useLang();
    const l: Lang = (lang as Lang) in t.trigger ? (lang as Lang) : "en";

    const form = useForm<AddBotFormData>({
        resolver: zodResolver(addBotSchema),
        defaultValues: { botToken: "" },
    });

    const handleClose = () => {
        setOpen(false);
        form.reset();
    };

    const onSubmit = async (values: AddBotFormData) => {
        const apiCall = async () => {
            try {
                logger.log("[AddTelegramBot] Submitting for institution:", institutionId);

                const api = createApi(session?.accessToken);
                await api.post("/api/telegram", {
                    institutionId,
                    botToken: values.botToken,
                });

                logger.log("[AddTelegramBot] Success");
                toast.success(t.success[l]);
                handleClose();
                await queryClient.invalidateQueries({ queryKey: ['telegram-bot', institutionId] });
            } catch (error: any) {
                logger.error("[AddTelegramBot] Error:", error);
            }
        };
        startPending(apiCall);
    };

    return (
        <DrawerForm
            open={open}
            setOpen={setOpen}
            trigger={
                <Button>
                    <Bot className="size-4 mr-2" />
                    {t.trigger[l]}
                </Button>
            }
            title={t.title[l]}
            description={t.description[l]}
        >
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name="botToken"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>{t.tokenLabel[l]}</FieldLabel>
                                <Input {...field} placeholder={t.tokenPlaceholder[l]} type="password" />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />
                </FieldGroup>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        {t.cancel[l]}
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? t.submitting[l] : t.submit[l]}
                    </Button>
                </div>
            </form>
        </DrawerForm>
    );
};

export default AddTelegramBotForm;