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
import { Loader2, ShieldMinus } from "lucide-react";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/tanstackQuery/getQueryClient";
import { institutionPrimaryAdminOptions } from "@/lib/tanstackQuery/options/institutionPrimaryAdminOptions";
import { handleApiError } from "@/lib/handleApiError";
import { logger } from "@/lib/logger";
import { useLang } from "@/hooks/useLang";

const t = {
    trigger:      { ru: "Снять роль админа", kk: "Әкімші рөлін алу", en: "Remove Admin Role" },
    title:        { ru: "Снять роль администратора", kk: "Әкімші рөлін алып тастау", en: "Remove Administrator Role" },
    description:  { ru: (name: string) => `Вы уверены, что хотите снять роль администратора с "${name}"? Пользователь останется в системе.`,
        kk: (name: string) => `"${name}" пайдаланушысынан әкімші рөлін алып тастағыңыз келетініне сенімдісіз бе? Пайдаланушы жүйеде қалады.`,
        en: (name: string) => `Are you sure you want to remove the administrator role from "${name}"? The user account will be kept.` },
    cancel:       { ru: "Отмена", kk: "Болдырмау", en: "Cancel" },
    remove:       { ru: "Снять", kk: "Алып тастау", en: "Remove" },
    removing:     { ru: "Снятие...", kk: "Алынуда...", en: "Removing..." },
    success:      { ru: "Роль администратора снята.", kk: "Әкімші рөлі алынып тасталды.", en: "Administrator role removed successfully." },
} as const;

type Lang = "ru" | "kk" | "en";

interface DeleteInstitutionAdminRoleFormProps {
    institutionId: string;
    userId: string;
    adminName: string;
}

export const DeleteInstitutionAdminRoleForm = ({
                                                   institutionId,
                                                   userId,
                                                   adminName,
                                               }: DeleteInstitutionAdminRoleFormProps) => {
    const [isPending, startPending] = useTransition();
    const [open, setOpen] = React.useState(false);
    const { data: session } = useSession();
    const queryClient = getQueryClient();
    const [lang] = useLang();

    const l: Lang = (lang as Lang) in t.trigger ? (lang as Lang) : "en";

    const handleDelete = () => {
        const apiCall = async () => {
            try {
                logger.log("[DeleteAdminRole] Removing admin role from user:", userId, "in institution:", institutionId);

                const api = createApi(session?.accessToken);
                await api.delete(`/institutions/${institutionId}/admins/${userId}`, {
                    headers: { Authorization: `Bearer ${session?.accessToken}` },
                });

                logger.log("[DeleteAdminRole] Successfully removed admin role from user:", userId);
                toast.success(t.success[l]);

                setOpen(false);
                await queryClient.invalidateQueries({
                    queryKey: institutionPrimaryAdminOptions(institutionId).queryKey,
                });
            } catch (error: any) {
                logger.error("[DeleteAdminRole] Failed to remove admin role:", error);
            }
        };

        startPending(apiCall);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <ShieldMinus className="size-4 mr-2" />
                    {t.trigger[l]}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t.title[l]}</AlertDialogTitle>
                    <AlertDialogDescription>{t.description[l](adminName)}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{t.cancel[l]}</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    {t.removing[l]}
                                </>
                            ) : (
                                t.remove[l]
                            )}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteInstitutionAdminRoleForm;