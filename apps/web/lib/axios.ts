import axios, { AxiosInstance } from "axios";
import { jwtDecode } from "jwt-decode";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getSession, signOut } from "next-auth/react";

type UpdateFn = (data?: any) => Promise<any>;
let _update: UpdateFn | null = null;

export function setSessionUpdater(update: UpdateFn) {
    _update = update;
}

export function createApi(token?: string, lang?: string): AxiosInstance {
    const instance = axios.create({
        baseURL: env.NEXT_PUBLIC_BACKEND_URL,
    });

    instance.interceptors.request.use((config) => {
        let acceptLang = lang;

        if (typeof window !== "undefined") {
            const match = document.cookie.match(/(?:^|; )lang=([^;]*)/);
            if (match) {
                acceptLang = decodeURIComponent(match[1] ?? "kk");
            }
        }

        if (token) config.headers.Authorization = `Bearer ${token}`;

        config.headers = config.headers ?? {};
        if (!("Accept-Language" in config.headers)) {
            config.headers["Accept-Language"] = acceptLang;
        }

        logger.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
            lang: acceptLang,
            authenticated: !!token,
        });

        return config;
    });

    instance.interceptors.response.use(
        (response) => {
            logger.log(`[API] ${response.status} ${response.config.url}`);
            return response;
        },
        async (error) => {
            const isStale =
                error.response?.status === 401 &&
                error.response?.data?.error === "SESSION_STALE";

            if (isStale && _update) {
                logger.log("[API] SESSION_STALE detected, forcing token refresh...");

                await _update({ forceRefresh: true });

                // Poll until NextAuth has saved the new token with stamp
                let attempts = 0;
                while (attempts < 10) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    const session = await getSession();
                    const decoded = session?.accessToken
                        ? jwtDecode(session.accessToken) as any
                        : null;

                    logger.log(`[API] Polling session attempt ${attempts + 1}, stamp=${decoded?.stamp}`);

                    if (decoded?.stamp) {
                        logger.log("[API] New token with stamp received, reloading page...");
                        window.location.reload();
                        return Promise.reject(error);
                    }

                    attempts++;
                }

                logger.warn("[API] Could not get new token after 10 attempts, reloading anyway...");
                window.location.reload();
                return Promise.reject(error);
            }

            if (error.response?.status === 401) {
                logger.warn("[API] Unauthorized, signing out...");
                await signOut();
            }

            logger.error(
                `[API] ${error.response?.status ?? "Network Error"} ${error.config?.url}`,
                error.response?.data ?? error.message
            );

            return Promise.reject(error);
        }
    );

    return instance;
}