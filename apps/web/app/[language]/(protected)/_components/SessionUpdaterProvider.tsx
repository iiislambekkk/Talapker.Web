"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {createApi, setSessionUpdater} from "@/lib/axios";

export function SessionUpdaterProvider() {
    const { update, data: session } = useSession();

    useEffect(() => {
        if (!session?.accessToken) return;

        setSessionUpdater(update);

        const api = createApi(session.accessToken);
        api.get("/api/auth/verify").catch(() => {});
    }, [update]);

    return null;
}