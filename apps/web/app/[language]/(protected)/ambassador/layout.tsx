import React from 'react';
import {SidebarInset, SidebarProvider} from "@workspace/ui/components/sidebar";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/authOptions";
import {redirect} from "next/navigation";
import UserRoles from "@/Data/models/UserRoles";
import RedirectToSignInOnSessionError from "@/lib/auth/RedirectToSignInOnSessionError";
import {AmbassadorSidebar} from "@/app/[language]/(protected)/ambassador/_components/AmbassadorSidebar";
import {AutoSignIn} from "@/app/[language]/(protected)/_components/AutoSignIn";
import {AmbassadorSiteHeader} from "@/app/[language]/(protected)/ambassador/_components/InstitutionAdminSiteHeader";

const InstitutionAmbassadorLayout = async ({children} : {children: React.ReactNode}) => {
    // @ts-ignore
    const session = await getServerSession(authOptions)

    if (!session) {
        return <AutoSignIn callbackUrl="/ambassador" />;
    }

    if (!session?.user.role.includes(UserRoles.TenantAmbassador)) {
        redirect("/forbidden?role=TenantAmbassador")
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
            <AmbassadorSidebar
                sidebarName={"ambassadorAdmin"}
            />
            <SidebarInset className={""}>
                <AmbassadorSiteHeader />
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

export default InstitutionAmbassadorLayout;