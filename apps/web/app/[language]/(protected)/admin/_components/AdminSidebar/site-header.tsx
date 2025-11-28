"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import {Button} from "@workspace/ui/components/button";
import {SidebarTrigger} from "@workspace/ui/components/sidebar";
import {ChangeLangButton} from "@/components/ChangeLangButton";
import {ThemeToggle} from "@workspace/ui/components/ThemeToggle";
import {Separator} from "@workspace/ui/components/separator";

export function SiteHeader() {
    const router = useRouter()
    const [canGoBack, setCanGoBack] = useState(false)
    const [canGoForward, setCanGoForward] = useState(false)

    // Check history state on component mount and URL changes
    useEffect(() => {
        // This is a basic check - you might need a more sophisticated approach
        // since Next.js App Router doesn't expose full history state
        setCanGoBack(typeof window !== 'undefined' && window.history.length > 1)
        setCanGoForward(true) // Always assume forward is possible for simplicity
    }, [])

    const handleGoBack = () => {
        if (canGoBack) {
            router.back()
        }
    }

    const handleGoForward = () => {
        if (canGoForward) {
            router.forward()
        }
    }

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <div className="flex items-center gap-1">
                    <SidebarTrigger sidebarName={"admin"} className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleGoBack}
                            disabled={!canGoBack}
                            className="h-8 w-8"
                            title="Go back"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleGoForward}
                            disabled={!canGoForward}
                            className="h-8 w-8"
                            title="Go forward"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />

                    <h1 className="text-base font-medium">Talapker Admin</h1>
                </div>

                <div className={"ml-auto flex items-center gap-2"}>
                    <ChangeLangButton />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}