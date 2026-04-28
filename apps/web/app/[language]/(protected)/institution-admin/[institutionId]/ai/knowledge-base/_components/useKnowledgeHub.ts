"use client";

import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { logger } from "@/lib/logger";



export function useKnowledgeHub(institutionId: string, token: string) {
    const qc = useQueryClient();

    if (Notification.permission === "default") {
        Notification.requestPermission();
    }

    useEffect(() => {
        if (!institutionId || !token) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hubs/knowledge`, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect()
            .build();

        connection.on("FileStatusChanged", (data: {
            fileId: string;
            status: string;
            entriesCount?: number;
            errorMessage?: string;
        }) => {
            logger.log("[KnowledgeHub] FileStatusChanged", data);

            qc.setQueryData<any[]>(
                ["knowledge-files", institutionId],
                (old) => old?.map((f) =>
                    f.id === data.fileId
                        ? {
                            ...f,
                            status: data.status,
                            entriesCount: data.entriesCount ?? f.entriesCount,
                            errorMessage: data.errorMessage ?? f.errorMessage,
                        }
                        : f
                )
            );
        });

        connection.on("KnowledgeFileNotification", (data: {
            type: "success" | "error";
            title: string;
            message: string;
            fileId: string;
        }) => {
            logger.log("[KnowledgeHub] KnowledgeFileNotification", data);

            if (Notification.permission === "granted") {
                new Notification(data.title, {
                    body: data.message,
                    icon: "/favicon.ico",
                });
            }
        });

        connection.start()
            .then(() => connection.invoke("JoinInstitution", institutionId))
            .catch((e) => logger.error("[KnowledgeHub] connect error", e));

        return () => {
            connection.invoke("LeaveInstitution", institutionId).catch(() => {});
            connection.stop();
        };
    }, [institutionId, token, qc]);
}