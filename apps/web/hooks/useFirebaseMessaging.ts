"use client"

import { getMessaging, getToken, onMessage, deleteToken } from "firebase/messaging";
import { app } from "@/lib/firebase";
import { createApi } from "@/lib/axios";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useFirebaseMessaging = () => {
    const router = useRouter();

    const getMessagingInstance = () => {
        if (typeof window === "undefined") return null;
        return getMessaging(app);
    };

    const subscribe = async (userId: string, authToken: string) => {
        const messaging = getMessagingInstance();
        if (!messaging) return;

        if (!userId || !authToken) {
            logger.warn("[FCM] Missing userId or authToken.");
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            logger.log("[FCM] Service worker registered:", registration.scope);

            const existingToken = localStorage.getItem("notifyToken");
            const existingUserId = localStorage.getItem("notifyUserId");
            logger.log(`[FCM] ExistingToken: ${existingToken}`);

            if (existingUserId && existingUserId !== userId && existingToken) {
                const deleted = await deleteToken(messaging);
                if (deleted) {
                    logger.log("[FCM] Old token deleted due to user switch.");
                    localStorage.removeItem("notifyToken");
                    localStorage.removeItem("notifyUserId");
                }
            }

            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            if (!token) {
                logger.warn("[FCM] No token available. Check notification permissions.");
                return;
            }

            logger.log("[FCM] Token obtained:", token);

            const tokenChanged = existingToken !== token;
            const userChanged = existingUserId !== userId;

            if (tokenChanged || userChanged) {
                logger.log("[FCM] Token or user changed, registering with server...");
                const api = createApi(authToken);

                const res = await api.post(
                    `/api/notifications/devices`,
                    { userId, deviceToken: token },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                if (res.status === 200) {
                    localStorage.setItem("notifyToken", token);
                    localStorage.setItem("notifyUserId", userId);
                    logger.log("[FCM] Token registered successfully.");
                } else {
                    logger.warn("[FCM] Unexpected response status:", res.status);
                }
            } else {
                logger.log("[FCM] Token already up to date, skipping registration.");
            }
        } catch (err) {
            logger.error("[FCM] Error during subscription:", err);
        }
    };

    const unsubscribe = async () => {
        const messaging = getMessagingInstance();
        if (!messaging) return;

        try {
            const deleted = await deleteToken(messaging);
            if (deleted) {
                logger.log("[FCM] Token deleted successfully.");
                localStorage.removeItem("notifyToken");
                localStorage.removeItem("notifyUserId");
            }
        } catch (err) {
            logger.error("[FCM] Failed to delete token:", err);
        }
    };

    const listenForeground = () => {
        const messaging = getMessagingInstance();
        if (!messaging) return () => {};

        return onMessage(messaging, (payload) => {
            logger.log("[FCM] Foreground message received:", payload);

            const title    = payload.data?.title    ?? "Уведомление";
            const body     = payload.data?.body     ?? "";
            const deepLink = payload.data?.deep_link ?? null;

            toast(title, {
                description: body,
                action: deepLink ? {
                    label: "Открыть",
                    onClick: () => router.push(deepLink)
                } : undefined
            });
        });
    };

    return { subscribe, listenForeground, unsubscribe };
};