import React from 'react';
import {AdminSidebar} from "@/app/[language]/(protected)/admin/_components/AdminSidebar/AdminSidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@workspace/ui/components/sidebar";
import {SiteHeader} from "@/app/[language]/(protected)/admin/_components/AdminSidebar/site-header";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/authOptions";
import {redirect} from "next/navigation";
import UserRoles from "@/Data/models/UserRoles";
import RedirectToSignInOnSessionError from "@/lib/auth/RedirectToSignInOnSessionError";

const AdminLayout = async ({children} : {children: React.ReactNode}) => {
    // @ts-ignore
    const session = await getServerSession(authOptions)

    if (!session || !session.user.role.includes(UserRoles.SystemAdmin)) {
        redirect("/not-admin")
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
          suppressHydrationWarning
        >
            <AdminSidebar sidebarName="admin"/>
            <SidebarInset className={""}>
                <SiteHeader />
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
    )
}

export default AdminLayout;