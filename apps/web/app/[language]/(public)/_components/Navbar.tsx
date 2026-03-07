"use client"
import * as React from "react"
import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@workspace/ui/components/navigation-menu"
import {signIn, useSession} from "next-auth/react";
import {useLang} from "@/hooks/useLang";
import {useIsMobile} from "@workspace/ui/hooks/use-mobile";
import Image from "next/image";
import Logo from "@/public/img/logo.svg";
import {useTranslations} from "next-intl";
import {ThemeToggle} from "@workspace/ui/components/ThemeToggle";
import {ChangeLangButton} from "@/components/ChangeLangButton";
import {Loader2} from "lucide-react";
import UserDropdown from "@/app/[language]/(public)/_components/UserDropdown";
import {Button} from "@workspace/ui/components/button";

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]


const Navbar = () => {
    const {data: session, status} = useSession()
    const [lang] = useLang()
    const t = useTranslations("NavBar")

    const handleLogin = () => {
        signIn("pharosIdentityServer", {
            callbackUrl: "/", // куда редиректить после логина
        });
    };

    const isMobile = useIsMobile()

    return (
        <NavigationMenu viewport={isMobile} className={"z-50 container! mx-auto w-full sticky top-0 px-4 md:px-6 lg:px-8"}>
            <div className={"w-full flex justify-between min-h-16 items-center mx-auto border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60"}>
                <div className="flex gap-2">
                    <Link href="/" className="flex items-center space-x-2 mr-4">
                        <Image width={48} height={48} src={Logo} alt="logo" className="size-9" />
                        <p className="hidden md:block hover:text-primary">{t("title")}</p>
                    </Link>

                    <NavigationMenuList className="w-full flex min-h-16 items-center mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        {/* === FOR STUDENTS === */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>{t("forStudents")}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-fit lg:grid-cols-[.75fr_1fr]">
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href="/about/platform"
                                                className="relative flex h-full w-[360px] flex-col justify-between rounded-2xl bg-card hover:bg-accent transition-colors duration-200 shadow-sm border border-border/40 p-4 md:p-6"
                                            >
                                                <div className="mb-2 text-lg font-medium">{t("universitiesTitle")}</div>
                                                <p className="text-muted-foreground text-sm leading-tight mb-2">
                                                    {t("universitiesDesc")}
                                                </p>
                                                <Image
                                                    src="/img/nav-platform.avif"
                                                    alt="Platform demo photo"
                                                    width={720}
                                                    height={480}
                                                    className="rounded-lg"
                                                />
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>

                                    <li>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href="/about/chat"
                                                className="relative flex h-full w-[260px] flex-col justify-between rounded-2xl bg-card hover:bg-accent transition-colors duration-200 shadow-sm border border-border/40 p-4 md:p-6"
                                            >
                                                <div className="mb-2 text-lg font-medium">{t("careerTitle")}</div>
                                                <p className="text-muted-foreground text-sm leading-tight mb-2">
                                                    {t("careerDesc")}
                                                </p>
                                                <Image
                                                    src="/img/chat-icon.avif"
                                                    alt="Chat"
                                                    width={480}
                                                    height={260}
                                                    className="w-32 h-auto mx-auto"
                                                />
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* === ABOUT === */}
                        <NavigationMenuItem className="hidden md:block">
                            <NavigationMenuTrigger>{t("about")}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-fit lg:grid-cols-[.75fr_1fr]">
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href="/about/platform"
                                                className="relative flex h-full w-[360px] flex-col justify-between rounded-2xl bg-card hover:bg-accent transition-colors duration-200 shadow-sm border border-border/40 p-4 md:p-6"
                                            >
                                                <div className="mb-2 text-lg font-medium">{t("platformTitle")}</div>
                                                <p className="text-muted-foreground text-sm leading-tight mb-2">
                                                    {t("platformDesc")}
                                                </p>
                                                <Image
                                                    src="/img/nav-platform.avif"
                                                    alt="Platform demo photo"
                                                    width={720}
                                                    height={480}
                                                    className="rounded-lg"
                                                />
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>

                                    <li>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href="/about/chat"
                                                className="relative flex h-full w-[260px] flex-col justify-between rounded-2xl bg-card hover:bg-accent transition-colors duration-200 shadow-sm border border-border/40 p-4 md:p-6"
                                            >
                                                <div className="mb-2 text-lg font-medium">{t("chatTitle")}</div>
                                                <p className="text-muted-foreground text-sm leading-tight mb-2">
                                                    {t("chatDesc")}
                                                </p>
                                                <Image
                                                    src="/img/chat-icon.avif"
                                                    alt="Chat icon"
                                                    width={480}
                                                    height={260}
                                                    className="w-32 h-auto mx-auto"
                                                />
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>

                                    <li>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href="/about/community"
                                                className="relative flex h-full w-full flex-col justify-between rounded-2xl bg-card hover:bg-accent transition-colors duration-200 shadow-sm border border-border/40 p-4 md:p-6"
                                            >
                                                <div className="mb-2 text-lg font-medium">{t("communityTitle")}</div>
                                                <p className="text-muted-foreground text-sm leading-tight mb-2">
                                                    {t("communityDesc")}
                                                </p>
                                                <Image
                                                    src="/img/chat-icon.avif"
                                                    alt="Community"
                                                    width={480}
                                                    height={260}
                                                    className="w-32 h-auto mx-auto"
                                                />
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>

                                    <li>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href="/about/assistant"
                                                className="relative flex h-full w-[260px] flex-col justify-between rounded-2xl bg-card hover:bg-accent transition-colors duration-200 shadow-sm border border-border/40 p-4 md:p-6"
                                            >
                                                <div className="mb-2 text-lg font-medium">{t("assistantTitle")}</div>
                                                <p className="text-muted-foreground text-sm leading-tight mb-2">
                                                    {t("assistantDesc")}
                                                </p>
                                                <Image
                                                    src="/img/chat-icon.avif"
                                                    alt="Assistant"
                                                    width={480}
                                                    height={260}
                                                    className="w-32 h-auto mx-auto"
                                                />
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>

                </div>

                <div className={"flex space-x-2 items-center"}>
                    <ThemeToggle/>
                    <ChangeLangButton />

                    {status === "loading" && (
                        <Loader2 className={"size-6 animate-spin mx-6"}/>
                    )}

                    {status === "authenticated" && session && (
                        <UserDropdown user={session.user} />
                    )}

                    {status === "unauthenticated" && (
                        <>
                            <Button onClick={handleLogin} variant="secondary">
                                {lang == "en" && "Log In"}
                                {lang == "kk" && "Кіру"}
                                {lang == "ru" && "Войти"}
                            </Button>

                            <Button onClick={handleLogin}>
                                {lang == "en" && "Get Started"}
                                {lang == "kk" && "Бастау"}
                                {lang == "ru" && "Начать"}
                            </Button>
                        </>
                    )}

                </div>
            </div>
        </NavigationMenu>
    )
}

export default Navbar;