import React from 'react';
import { SidebarInset, SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@workspace/ui/components/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import UserRoles from "@/Data/models/UserRoles";
import RedirectToSignInOnSessionError from "@/lib/auth/RedirectToSignInOnSessionError";
import { AutoSignIn } from "@/app/[language]/(protected)/_components/AutoSignIn";
import { ProspectSidebar } from "./_components/ProspectSidebar";
import { ProspectSiteHeader } from "./_components/ProspectSiteHeader";

const ProspectLayout = async ({ children }: { children: React.ReactNode }) => {
    // @ts-ignore
    const session = await getServerSession(authOptions);

    if (!session) {
        return <AutoSignIn callbackUrl="/prospect" />;
    }


    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
            suppressHydrationWarning
        >
            <ProspectSidebar sidebarName="prospect" />
            <SidebarInset>
                <ProspectSiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="container mx-auto @container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarInset>
            <RedirectToSignInOnSessionError />
        </SidebarProvider>
    );
};

export default ProspectLayout;