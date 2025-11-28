"use client"


import {
    SidebarGroup, SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar,
} from "@workspace/ui/components/sidebar"
import {ChevronRight, LucideIcon} from "lucide-react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@workspace/ui/components/collapsible";
import {cn} from "@workspace/ui/lib/utils";
import Link from "next/link";
import {useTranslations} from "next-intl";

export function InstitutionAdminNavMain({
                           items,
                       }: {
    items: {
        localizationKey: string
        url?: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            localizationKey: string
            url: string
        }[]
    }[]
}) {

    const { state, toggleSidebar, setOpen } = useSidebar()
    const expandIfCollapsed = () => {
        if (state === "collapsed") toggleSidebar()
    }
    const t = useTranslations()

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>{

                    if (!item.items) {
                        return (
                            <SidebarMenuItem key={t(item.localizationKey)}>
                                <SidebarMenuButton tooltip={t(item.localizationKey)} asChild>
                                    <Link href={item.url ?? "#"}>
                                        {item.icon && <item.icon />}
                                        <span>{t(item.localizationKey)}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    }

                    if (item.items) return  (
                        <Collapsible
                            key={t(item.localizationKey)}
                            asChild
                            defaultOpen={item.isActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={t(item.localizationKey)} onClick={expandIfCollapsed}>
                                        {item.icon && <item.icon />}
                                        <span>{t(item.localizationKey)}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuSubItem key={t(subItem.localizationKey)}>
                                                <SidebarMenuSubButton asChild>
                                                    <a href={subItem.url}>
                                                        <span>{t(subItem.localizationKey)}</span>
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
