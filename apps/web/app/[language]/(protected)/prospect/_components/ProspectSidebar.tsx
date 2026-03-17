"use client"

import * as React from "react";
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarGroup, SidebarGroupLabel,
} from "@workspace/ui/components/sidebar";
import Link from "next/link";
import { Building2, MessageSquare, Sparkles, Settings, User } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { ProspectNavUser } from "./ProspectNavUser";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { createApi } from "@/lib/axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { generateS3UrlFromKey } from "@/lib/generateS3UrlFromKey";
import {useProspectStore} from "@/lib/stores/prospectStore";

const t = {
    ru: { group: "Prospect", institutions: "Университеты", chat: "Чат", ai: "Talapker AI", settings: "Настройки", profile: "Профиль", selectUniversity: "Выбрать университет" },
    kk: { group: "Prospect", institutions: "Университеттер", chat: "Чат", ai: "Talapker AI", settings: "Баптаулар", profile: "Профиль", selectUniversity: "Университет таңдау" },
    en: { group: "Prospect", institutions: "Institutions", chat: "Chat", ai: "Talapker AI", settings: "Settings", profile: "Profile", selectUniversity: "Select university" },
};

const subscribedInstitutionsQueryOptions = (userId: string) => queryOptions({
    queryKey: ["prospect", "subscriptions", userId],
    queryFn: async () => {
        const api = createApi();
        const res = await api.get(`/api/prospects/subscriptions?userId=${userId}`);
        return res.data as { id: string; name: string; logoKey: string }[];
    },
    enabled: !!userId,
});

export function ProspectSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [lang] = useLang();
    const labels = t[lang as keyof typeof t] ?? t.ru;
    const { data: session } = useSession();
    const userId = session?.user?.sub ?? "";

    const { selectedInstitutionId, setSelectedInstitutionId } = useProspectStore();
    const { data: subscriptions } = useQuery(subscribedInstitutionsQueryOptions(userId));

    React.useEffect(() => {
        if (!subscriptions || !selectedInstitutionId) return;
        const stillSubscribed = subscriptions.some(s => s.id === selectedInstitutionId);
        if (!stillSubscribed) {
            setSelectedInstitutionId(null);
        }
    }, [subscriptions, selectedInstitutionId]);

    const hasSubscriptions = subscriptions && subscriptions.length > 0;

    const navItems = [
        { label: labels.institutions, icon: Building2, url: "/prospect/institutions", requiresInstitution: false },
        { label: labels.chat,         icon: MessageSquare, url: "/prospect/chats",        requiresInstitution: true },
        { label: labels.ai,           icon: Sparkles, url: "/prospect/ai",               requiresInstitution: true },
        { label: labels.settings,     icon: Settings, url: "/prospect/settings",         requiresInstitution: false },
        { label: labels.profile,      icon: User, url: "/prospect/profile",              requiresInstitution: false },
    ];

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <Link href="/">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M33.724 36.5809C37.7426 32.5622 40.0003 27.1118 40.0003 21.4286C40.0003 15.7454 37.7426 10.2949 33.724 6.27629C29.7054 2.25765 24.2549 1.02188e-06 18.5717 0C12.8885 -1.02188e-06 7.43807 2.25764 3.41943 6.27628L10.4905 13.3473C11.6063 14.4631 13.4081 14.4074 14.8276 13.7181C15.9836 13.1568 17.2622 12.8571 18.5717 12.8571C20.845 12.8571 23.0252 13.7602 24.6326 15.3677C26.2401 16.9751 27.1431 19.1553 27.1431 21.4286C27.1431 22.7381 26.8435 24.0167 26.2822 25.1727C25.5929 26.5922 25.5372 28.394 26.6529 29.5098L33.724 36.5809Z" fill="#1e9df1"/>
                                    <path d="M30 40H19.5098C17.9943 40 16.5408 39.398 15.4692 38.3263L1.67368 24.5308C0.60204 23.4592 0 22.0057 0 20.4902V10L30 40Z" fill="#1e9df1"/>
                                    <path d="M10.7143 39.9999H4.28571C1.91878 39.9999 0 38.0812 0 35.7142V29.2856L10.7143 39.9999Z" fill="#1e9df1"/>
                                </svg>
                                <span className="text-base font-semibold">Talapker</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {hasSubscriptions && (
                    <div className="px-2 pb-1 group-data-[collapsible=icon]:hidden">
                        <Select
                            value={selectedInstitutionId ?? ""}
                            onValueChange={(val) => setSelectedInstitutionId(val || null)}
                        >
                            <SelectTrigger className="w-full h-9 text-sm">
                                <SelectValue placeholder={labels.selectUniversity} />
                            </SelectTrigger>
                            <SelectContent>
                                {subscriptions.map((inst) => (
                                    <SelectItem key={inst.id} value={inst.id}>
                                        <div className="flex items-center gap-2">
                                            {inst.logoKey && (
                                                <img
                                                    src={generateS3UrlFromKey(inst.logoKey)}
                                                    alt=""
                                                    className="w-5 h-5 rounded object-cover"
                                                />
                                            )}
                                            <span className="line-clamp-1">{inst.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{labels.group}</SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems
                            .filter(item => !item.requiresInstitution || !!selectedInstitutionId)
                            .map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton asChild tooltip={item.label}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))
                        }
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <ProspectNavUser />
            </SidebarFooter>
        </Sidebar>
    );
}