"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useLang } from "@/hooks/useLang";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type Lang = "ru" | "kk" | "en";

const t = {
    heading:  { ru: "Выполняется вход…",         kk: "Кіру орындалуда…",        en: "Signing you in…"          },
    subtext:  { ru: "Перенаправление на страницу авторизации", kk: "Авторизация бетіне бағытталуда", en: "Redirecting to authorization" },
} as const;

export const AutoSignIn = ({ callbackUrl }: { callbackUrl: string }) => {
    const [rawLang] = useLang();
    const l: Lang = (["ru", "kk", "en"] as Lang[]).includes(rawLang as Lang) ? (rawLang as Lang) : "en";

    useEffect(() => {
        signIn("pharosIdentityServer", { callbackUrl });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            {/* Animated rings */}
            <div className="relative flex items-center justify-center mb-8">
                <motion.div
                    className="absolute w-24 h-24 rounded-full border border-primary/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute w-16 h-16 rounded-full border border-primary/30"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
                <motion.div
                    className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Sparkles className="w-6 h-6 text-primary" />
                </motion.div>
            </div>

            {/* Text */}
            <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-semibold tracking-tight mb-2"
            >
                {t.heading[l]}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-muted-foreground mb-8"
            >
                {t.subtext[l]}
            </motion.p>

            {/* Dot loader */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-1.5"
            >
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                    />
                ))}
            </motion.div>
        </div>
    );
};