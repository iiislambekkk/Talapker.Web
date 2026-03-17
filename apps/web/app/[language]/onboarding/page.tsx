"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { useLang } from "@/hooks/useLang";
import { logger } from "@/lib/logger";
import axios from "axios";
import {createApi} from "@/lib/axios";

const t = {
    title:             { ru: "Добро пожаловать! Настройте аккаунт", kk: "Қош келдіңіз! Аккаунтыңызды баптаңыз", en: "Welcome! Set up your account" },
    description:       { ru: "Настройка аккаунта для:", kk: "Аккаунт баптау:", en: "Setting up account for:" },
    firstName:         { ru: "Имя", kk: "Аты", en: "First name" },
    lastName:          { ru: "Фамилия", kk: "Тегі", en: "Last name" },
    password:          { ru: "Новый пароль", kk: "Жаңа құпия сөз", en: "New password" },
    confirmPassword:   { ru: "Подтвердите пароль", kk: "Құпия сөзді растаңыз", en: "Confirm password" },
    submit:            { ru: "Завершить настройку", kk: "Баптауды аяқтау", en: "Complete setup" },
    submitting:        { ru: "Сохранение...", kk: "Сақталуда...", en: "Setting up..." },
    invalidLink:       { ru: "Недействительная или устаревшая ссылка.", kk: "Жарамсыз немесе ескірген сілтеме.", en: "Invalid or expired onboarding link." },
    errorRequired:     { ru: "Все поля обязательны.", kk: "Барлық өрістер міндетті.", en: "All fields are required." },
    errorPasswordMatch:{ ru: "Пароли не совпадают.", kk: "Құпия сөздер сәйкес келмейді.", en: "Passwords do not match." },
    errorGeneric:      { ru: "Что-то пошло не так.", kk: "Бірдеңе дұрыс болмады.", en: "Something went wrong." },
    success:           { ru: "Аккаунт успешно настроен!", kk: "Аккаунт сәтті бапталды!", en: "Account set up successfully!" },
} as const;

type Lang = "ru" | "kk" | "en";

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [lang] = useLang();

    const l: Lang = (lang as Lang) in t.title ? (lang as Lang) : "en";

    if (!searchParams) {
        return <>HAHAHAHH!</>
    }

    const code = searchParams.get("code") ?? "";
    const email = searchParams.get("email") ?? "";

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    if (!code || !email) {
        logger.warn("[Onboarding] Missing code or email in search params.");
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-destructive">{t.invalidLink[l]}</p>
            </div>
        );
    }

    const handleSubmit = () => {
        if (!firstName || !lastName || !password) {
            logger.warn("[Onboarding] Validation failed: missing fields.");
            toast.error(t.errorRequired[l]);
            return;
        }

        if (password !== confirmPassword) {
            logger.warn("[Onboarding] Validation failed: passwords do not match.");
            toast.error(t.errorPasswordMatch[l]);
            return;
        }

        startTransition(async () => {
            try {
                logger.log("[Onboarding] Submitting for:", email);

                const api = createApi()

                await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/onboarding`, {
                    email,
                    code,
                    newPassword: password,
                    firstName,
                    lastName,
                });

                logger.log("[Onboarding] Success for:", email);
                toast.success(t.success[l]);
                router.push("/");
            } catch (err: any) {
                logger.error("[Onboarding] Failed:", err);
                toast.error(err.response?.data?.message ?? t.errorGeneric[l]);
            }
        });
    };

    return (
        <div className={"min-h-screen flex flex-col items-center justify-center gap-12"}>
            <div className={"flex gap-4 items-center"}>
                <img src={"/img/logo.svg"} className={"size-16"} />
                <p className={"text-4xl font-bold"}>Talapker</p>
            </div>


            <div className="flex items-center justify-center bg-muted/40">

                <Card className="w-full min-w-md">
                    <CardHeader>
                        <CardTitle>{t.title[l]}</CardTitle>
                        <CardDescription>
                            {t.description[l]} <strong>{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label>{t.firstName[l]}</Label>
                            <Input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isPending} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t.lastName[l]}</Label>
                            <Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isPending} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t.password[l]}</Label>
                            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isPending} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t.confirmPassword[l]}</Label>
                            <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isPending} />
                        </div>

                        <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    {t.submitting[l]}
                                </>
                            ) : (
                                t.submit[l]
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
