"use client"

import {
    IconDotsVertical,
    IconLogout,
} from "@tabler/icons-react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@workspace/ui/components/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@workspace/ui/components/sidebar"
import { signOut, useSession } from "next-auth/react"
import { env } from "@/lib/env"

export function AmbassadorNavUser() {
    const { isMobile } = useSidebar()
    const { data: session, status } = useSession()

    if (status !== "authenticated") {
        return null
    }

    const user = {
        name: session.user.name,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email,
        avatar: session.user.image ?? `https://avatar.vercel.sh/${session.user.email}`,
    }

    const handleSignOut = async () => {
        const endSessionUrl = `${env.NEXT_PUBLIC_BACKEND_URL}/connect/endsession?post_logout_redirect_uri=${encodeURIComponent(env.NEXT_PUBLIC_NEXTAUTH_URL)}/`

        await signOut({ redirect: false })

        window.location.href = endSessionUrl
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">
                                    {user.firstName[0]}
                                    {user.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {user.name ?? user.email.split("@")[0]}
                                </span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user.email}
                                </span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">
                                        {user.firstName[0]}
                                        {user.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.name ?? user.email.split("@")[0]}
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                            <IconLogout />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}