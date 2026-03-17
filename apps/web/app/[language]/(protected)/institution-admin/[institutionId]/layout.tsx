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

const Layout = async ({children, params } : {children: React.ReactNode, params : any}) => {
    // @ts-ignore
    const session = await getServerSession(authOptions)
    const {institutionId} = params

    if (session!.user.tenantId != institutionId) {
        redirect("/forbidden?role=TenantAdmin")
    }

    return (
        <>
            {children}
        </>
    )
}

export default Layout;