"use client"

import * as React from "react"
import {
  IconCamera,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import Link from "next/link";
import {
    SquareTerminal,
    Brain,
    MessageSquare,
    Users,
    UserSearch,
    Shield,
    FileText,
    Users2,
    Calendar,
    Palette,
    UserCog,
    Settings, Stars
} from 'lucide-react';
import {
    InstitutionAdminNavSecondary
} from "@/app/[language]/(protected)/institution-admin/_components/AdminSidebar/InstitutionAdminNavSecondary";
import {
    InstitutionAdminNavUser
} from "@/app/[language]/(protected)/institution-admin/_components/AdminSidebar/InstitutionAdminNavUser";
import LocalizationKeys from "@/i18n/messages/LocalizationKeys";
import {useParams} from "next/navigation";
import {
    InstitutionAdminNavMain
} from "@/app/[language]/(protected)/institution-admin/_components/AdminSidebar/InstitutionAdminNavMain";

export function InstitutionAdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const {institutionId} = useParams() as {institutionId: string};

    const data = {
        user: {
            name: "shadcn",
            email: "m@example.com",
            avatar: "/avatars/shadcn.jpg",
        },
        navMain:  [
           /* {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Analytics,
                icon: SquareTerminal,
                isActive: true,
                items: [
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Engagement,
                        url: `/institution-admin/${institutionId}/analytics/engagement`,
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Prospect,
                        url: `/institution-admin/${institutionId}/analytics/prospect`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Ambassador,
                        url: `/institution-admin/${institutionId}/analytics/ambassador`
                    },
                ],
            },*/
            {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Content,
                icon: FileText,
                url: `/institution-admin/${institutionId}/content`,

                items: [
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.General,
                        url: `/institution-admin/${institutionId}/content/general`,
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Departments,
                        url: `/institution-admin/${institutionId}/content/departments`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.EducationPrograms,
                        url: `/institution-admin/${institutionId}/content/education-programs`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Posts,
                        url: `/institution-admin/${institutionId}/content/posts`
                    },
                ],
            },
           /* {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Insights,
                icon: Brain,
                items: [
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Applications,
                        url: `/institution-admin/${institutionId}/insights/applications`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Conversations,
                        url: `/institution-admin/${institutionId}/insights/conversations`
                    }
                ],
            },*/
            {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.AI,
                icon: Stars,
                items: [
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.AI_General,
                        url: `/institution-admin/${institutionId}/ai/manage`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.AI_Telegram,
                        url: `/institution-admin/${institutionId}/ai/telegram`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.AI_Knowledge_Base,
                        url: `/institution-admin/${institutionId}/ai/knowledge-base`
                    }
                ],
            },
           /* {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Conversations,
                icon: MessageSquare,
                items: [
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Manage,
                        url: `/institution-admin/${institutionId}/conversations/applications`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Inbox,
                        url: `/institution-admin/${institutionId}/conversations/inbox`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Outbox,
                        url: `/institution-admin/${institutionId}/conversations/outbox`
                    }
                ],
            },*/
            {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Ambassadors,
                icon: Users,
                items: [
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Manage,
                        url: `/institution-admin/${institutionId}/ambassadors/manage`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Invitations,
                        url: `/institution-admin/${institutionId}/ambassadors/invitations`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Timesheet,
                        url: `/institution-admin/${institutionId}/ambassadors/timesheet`
                    }
                ],
            },
            {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Prospects,
                icon: UserSearch,
                items: [
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Manage,
                        url: `/institution-admin/${institutionId}/prospects/manage`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Invite,
                        url: `/institution-admin/${institutionId}/prospects/invite`
                    }
                ],
            },
           /* {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Moderation,
                icon: Shield,
                url: `/institution-admin/${institutionId}/moderation`
            },
            {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Community,
                icon: Users2,
                url: `/institution-admin/${institutionId}/community`
            },*/
            {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Events,
                icon: Calendar,
                url: `/institution-admin/${institutionId}/events`
            },
            /*{
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Customization,
                icon: Palette,
                items: [
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Prospects,
                        url: `/institution-admin/${institutionId}/customization/prospects`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Degrees,
                        url: `/institution-admin/${institutionId}/customization/degrees`
                    },
                    {
                        localizationKey: LocalizationKeys.InstitutionAdminMenu.Features,
                        url: `/institution-admin/${institutionId}/customization/features`
                    }
                ],
            },*/
            /*{
                localizationKey: LocalizationKeys.InstitutionAdminMenu.AdminUsers,
                icon: UserCog,
                url: `/institution-admin/${institutionId}/admins`
            },
            {
                localizationKey: LocalizationKeys.InstitutionAdminMenu.Settings,
                icon: Settings,
                url: `/institution-admin/${institutionId}/settings`
            }*/
        ],
        navClouds: [
            {
                title: "Capture",
                icon: IconCamera,
                isActive: true,
                url: "#",
                items: [
                    {
                        title: "Active Proposals",
                        url: "#",
                    },
                    {
                        title: "Archived",
                        url: "#",
                    },
                ],
            },
            {
                title: "Proposal",
                icon: IconFileDescription,
                url: "#",
                items: [
                    {
                        title: "Active Proposals",
                        url: "#",
                    },
                    {
                        title: "Archived",
                        url: "#",
                    },
                ],
            },
            {
                title: "Prompts",
                icon: IconFileAi,
                url: "#",
                items: [
                    {
                        title: "Active Proposals",
                        url: "#",
                    },
                    {
                        title: "Archived",
                        url: "#",
                    },
                ],
            },
        ],
        navSecondary: [
            {
                title: "Settings",
                url: "#",
                icon: IconSettings,
            },
            {
                title: "Get Help",
                url: "#",
                icon: IconHelp,
            },
            {
                title: "Search",
                url: "#",
                icon: IconSearch,
            },
        ],
        documents: [
            {
                name: "Data Library",
                url: "#",
                icon: IconDatabase,
            },
            {
                name: "Reports",
                url: "#",
                icon: IconReport,
            },
            {
                name: "Word Assistant",
                url: "#",
                icon: IconFileWord,
            },
        ],
    }


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M33.724 36.5809C37.7426 32.5622 40.0003 27.1118 40.0003 21.4286C40.0003 15.7454 37.7426 10.2949 33.724 6.27629C29.7054 2.25765 24.2549 1.02188e-06 18.5717 0C12.8885 -1.02188e-06 7.43807 2.25764 3.41943 6.27628L10.4905 13.3473C11.6063 14.4631 13.4081 14.4074 14.8276 13.7181C15.9836 13.1568 17.2622 12.8571 18.5717 12.8571C20.845 12.8571 23.0252 13.7602 24.6326 15.3677C26.2401 16.9751 27.1431 19.1553 27.1431 21.4286C27.1431 22.7381 26.8435 24.0167 26.2822 25.1727C25.5929 26.5922 25.5372 28.394 26.6529 29.5098L33.724 36.5809Z" fill="#1e9df1"></path>
                      <path d="M30 40H19.5098C17.9943 40 16.5408 39.398 15.4692 38.3263L1.67368 24.5308C0.60204 23.4592 0 22.0057 0 20.4902V10L30 40Z" fill="#1e9df1"></path>
                      <path d="M10.7143 39.9999H4.28571C1.91878 39.9999 0 38.0812 0 35.7142V29.2856L10.7143 39.9999Z" fill="#1e9df1"></path>
                  </svg>
                <span className="text-base font-semibold">Talapker</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <InstitutionAdminNavMain items={data.navMain} />
        <InstitutionAdminNavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <InstitutionAdminNavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
