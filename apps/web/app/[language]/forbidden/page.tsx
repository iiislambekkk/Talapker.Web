import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowLeft, ShieldX } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@workspace/ui/components/button";
import {getServerLang} from "@/lib/lang/getServerLang";

type Lang = "ru" | "kk" | "en";

const t = {
    title: {
        ru: "Доступ запрещён",
        kk: "Кіру тыйым салынған",
        en: "Access Restricted",
    },
    descriptions: {
        TenantAmbassador: {
            ru: "У вас нет прав амбассадора",
            kk: "Сізде амбассадор құқықтары жоқ",
            en: "You don't have ambassador access",
        },
        TenantAdmin: {
            ru: "У вас нет прав администратора",
            kk: "Сізде әкімші құқықтары жоқ",
            en: "You don't have admin access",
        },
        PrimaryTenantAdmin: {
            ru: "У вас нет прав главного администратора",
            kk: "Сізде бас әкімші құқықтары жоқ",
            en: "You don't have primary admin access",
        },
        SystemAdmin: {
            ru: "У вас нет прав системного администратора",
            kk: "Сізде жүйелік әкімші құқықтары жоқ",
            en: "You don't have system admin access",
        },
        default: {
            ru: "У вас недостаточно прав для доступа к этой странице",
            kk: "Бұл бетке кіруге құқығыңыз жеткіліксіз",
            en: "You don't have permission to access this page",
        },
    },
    back: {
        ru: "На главную",
        kk: "Басты бетке",
        en: "Back to Home",
    },
} as const;

type RoleKey = keyof typeof t.descriptions;

interface ForbiddenPageProps {
    searchParams: { role?: string; lang?: string };
}

const ForbiddenPage = async ({ searchParams }: ForbiddenPageProps) => {
    const lang = await getServerLang("kk")

    const role = searchParams.role as RoleKey | undefined;
    const description = role && role in t.descriptions
        ? t.descriptions[role][lang]
        : t.descriptions.default[lang];

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="bg-destructive/10 rounded-full p-4 w-fit mx-auto">
                        <ShieldX className="size-16 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">{t.title[lang]}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="mx-auto max-w-md w-full">
                    <Link href="/" className={buttonVariants({ className: "w-full", variant: "destructive" })}>
                        <ArrowLeft />
                        {t.back[lang]}
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForbiddenPage;