"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Separator } from "@workspace/ui/components/separator";
import { ChangeLangButton } from "@/components/ChangeLangButton";
import { ThemeToggle } from "@workspace/ui/components/ThemeToggle";

export function ProspectSiteHeader() {
    const router = useRouter();
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        setCanGoBack(typeof window !== "undefined" && window.history.length > 1);
    }, []);

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <div className="flex items-center gap-1">
                    <SidebarTrigger sidebarName="prospect" className="-ml-1" />
                    <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} disabled={!canGoBack} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.forward()} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <ChangeLangButton />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}