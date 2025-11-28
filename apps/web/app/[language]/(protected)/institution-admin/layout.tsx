import React from 'react';
import {SidebarInset, SidebarProvider} from "@workspace/ui/components/sidebar";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/authOptions";
import {redirect} from "next/navigation";
import UserRoles from "@/Data/models/UserRoles";
import RedirectToSignInOnSessionError from "@/lib/auth/RedirectToSignInOnSessionError";
import {
    InstitutionAdminSidebar
} from "@/app/[language]/(protected)/institution-admin/_components/AdminSidebar/InstitutionAdminSidebar";
import {
    InstitutionAdminSiteHeader
} from "@/app/[language]/(protected)/institution-admin/_components/AdminSidebar/InstitutionAdminSiteHeader";

const InstitutionAdminLayout = async ({children} : {children: React.ReactNode}) => {
    // @ts-ignore
    const session = await getServerSession(authOptions)

    if (!session || !session.user.role.includes(UserRoles.TenantAdmin)) {
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
            <InstitutionAdminSidebar
                sidebarName={"institutionAdmin"}
            />
            <SidebarInset className={""}>
                <InstitutionAdminSiteHeader />
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

export default InstitutionAdminLayout;