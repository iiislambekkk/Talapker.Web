"use client"

import React from 'react';
import Link from "next/link";
import Logo from "@/public/img/logo.svg"
import Image from "next/image";
import {Loader2} from "lucide-react";
import {ThemeToggle} from "@workspace/ui/components/ThemeToggle";
import {ChangeLangButton} from "@/components/ChangeLangButton";
import {signIn, useSession} from "next-auth/react";
import {Button, buttonVariants} from "@workspace/ui/components/button";
import UserDropdown from "@/app/[language]/(public)/_components/UserDropdown";
import {useLang} from "@/hooks/useLang";

type NavigationItem = {
    name: string;
    href: string;
}

type FooterLinkGroups = {
    name: string;
    links: NavigationItem[];
}

const footerCategories : FooterLinkGroups[] = [
    {
        name: "Products",
        links: [
            {
                name: "Platform",
                href: "the-talapker-platform"
            },
            {
                name: "Chat",
                href: "chat"
            },
            {
                name: "Assistant",
                href: "assistant"
            },
            {
                name: "Assistant",
                href: "assistant"
            },
            {
                name: "Community",
                href: "community"
            },
            {
                name: "Pricing",
                href: "pricing"
            }
        ]
    },
    {
        name: "solutions",
        links: [
            {
                name: "Universities",
                href: "for-universities"
            },
            {
                name: "Colleges",
                href: "for-colleges"
            },
            {
                name: "For students",
                href: "for-students"
            }
        ]
    }
]

const Footer = () => {
    const {data: session, status} = useSession()
    const [lang] = useLang()
    const handleLogin = () => {
        signIn("pharosIdentityServer", {
            callbackUrl: "/", // куда редиректить после логина
        });
    };


    return (
        <footer className={"container mx-auto px-4 md:px-6 lg:px-8 sticky top-0 z-50 w-full"}>
            <div className={"flex min-h-16 items-center mx-auto border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60"}>
                <nav className={"hidden md:flex md:flex-1 items-center justify-between "}>
                    <div className={"flex items-center space-x-2"}>
                     {/*   {navigationItems.map((item: NavigationItem, index) => (
                            <Link
                                key={index}
                                href={`${item.href}`}
                                className={"text-sm font-medium transition-colors hover:text-primary"}>
                                {item.name}
                            </Link>
                        ))}*/}
                    </div>

                </nav>
            </div>
        </footer>
    );
};

export default Footer;