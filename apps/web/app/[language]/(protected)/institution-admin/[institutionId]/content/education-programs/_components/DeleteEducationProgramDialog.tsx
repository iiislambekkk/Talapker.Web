"use client";

import React, { useTransition } from 'react';
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
import { Trash2, Loader2 } from "lucide-react";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/tanstackQuery/getQueryClient";
import { useLang } from "@/hooks/useLang";
import { logger } from "@/lib/logger";

interface DeleteEducationProgramDialogProps {
    programId: string;
    programName: string;
    institutionId: string;
}

export const DeleteEducationProgramDialog = ({
                                                 programId,
                                                 programName,
                                                 institutionId
                                             }: DeleteEducationProgramDialogProps) => {
    const [isPending, startPending] = useTransition();
    const [open, setOpen] = React.useState(false);
    const { data: session } = useSession();
    const queryClient = getQueryClient();
    const [lang] = useLang();

    const handleDelete = async () => {
        const apiCall = async () => {
            try {
                logger.log("[DeleteProgram] Deleting program:", programId);
                const api = createApi();

                await api.delete(`/api/education-programs/${programId}`, {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                });

                logger.log("[DeleteProgram] Successfully deleted program:", programId);
                toast.success(
                    lang === "ru" ? "Программа успешно удалена!" :
                        lang === "kk" ? "Бағдарлама сәтті жойылды!" :
                            "Program successfully deleted!"
                );

                setOpen(false);
                await queryClient.invalidateQueries({ queryKey: ['education-programs', institutionId] });
            } catch (error: any) {
                logger.error("[DeleteProgram] Failed to delete program:", programId, error);
                toast.error(
                    error.message ||
                    (lang === "ru" ? "Ошибка при удалении" :
                        lang === "kk" ? "Жою кезінде қате" :
                            "Error while deleting")
                );
            }
        };
        startPending(apiCall);
    };

    const getTitle = () => {
        if (lang === "ru") return "Удалить программу";
        if (lang === "kk") return "Бағдарламаны жою";
        return "Delete program";
    };

    const getDescription = () => {
        if (lang === "ru") return `Вы уверены, что хотите удалить программу "${programName}"? Это действие нельзя отменить.`;
        if (lang === "kk") return `Сіз "${programName}" бағдарламасын жойғыңыз келетініне сенімдісіз бе? Бұл әрекетті кері қайтару мүмкін емес.`;
        return `Are you sure you want to delete "${programName}"? This action cannot be undone.`;
    };

    const getCancelText = () => {
        if (lang === "ru") return "Отмена";
        if (lang === "kk") return "Болдырмау";
        return "Cancel";
    };

    const getDeleteText = () => {
        if (lang === "ru") return "Удалить";
        if (lang === "kk") return "Жою";
        return "Delete";
    };

    const getDeletingText = () => {
        if (lang === "ru") return "Удаление...";
        if (lang === "kk") return "Жойылуда...";
        return "Deleting...";
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="red" size="sm" className="w-full justify-start p-0">
                    <Trash2 className="size-4 mr-2" />
                    {lang === "ru" ? "Удалить" : lang === "kk" ? "Жою" : "Delete"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
                    <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{getCancelText()}</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    {getDeletingText()}
                                </>
                            ) : (
                                getDeleteText()
                            )}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteEducationProgramDialog;