"use client"

import * as React from "react"
import { NavMain } from "@/components/layout/NavMain"
import { NavSecondary } from "@/components/layout/NavSecondary"
import { NavUser } from "@/components/layout/NavUser"
import { WorkspaceSwitcher } from "@/components/layout/WorkspaceSwitcher"
import { useSession } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  GitBranch,
  ShieldAlert,
  LifeBuoy,
  Cpu,
  GitCommit,
  Workflow,
  Settings2,
  Users,
  Activity,
  Building2,
} from "lucide-react"

const navigationData = {
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: "Repositories",
      url: "/repositories",
      icon: <GitBranch className="size-4" />,
    },
    {
      title: "Findings",
      url: "/findings",
      icon: <ShieldAlert className="size-4" />,
    },
    {
      title: "Recovery Plans",
      url: "/recovery-plans",
      icon: <LifeBuoy className="size-4" />,
    },
    {
      title: "Background Jobs",
      url: "/jobs",
      icon: <Workflow className="size-4" />,
    },
  ],
  navMonitoring: [
    {
      title: "AI Activity",
      url: "/ai-activity",
      icon: <Cpu className="size-4" />,
    },
    {
      title: "Commit History",
      url: "/commit-history",
      icon: <GitCommit className="size-4" />,
    },
    {
      title: "Audit Trail",
      url: "/activity",
      icon: <Activity className="size-4" />,
    },
  ],
  navAdministration: [
    {
      title: "Workspaces",
      url: "/workspaces",
      icon: <Building2 className="size-4" />,
    },
    {
      title: "Integrations",
      url: "/settings/integrations",
      icon: <GitBranch className="size-4" />,
    },
    {
      title: "Team Members",
      url: "/settings/members",
      icon: <Users className="size-4" />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2 className="size-4" />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const currentUser = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "/avatars/shadcn.jpg",
      }
    : {
        name: "Developer",
        email: "dev@projectrescue.local",
        avatar: "/avatars/shadcn.jpg",
      }

  return (
    <Sidebar collapsible="offcanvas" {...props} className="border-r border-border/80">
      <SidebarHeader className="border-b border-border/60 pb-2">
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent className="px-2 py-3 space-y-4">
        <div>
          <div className="px-3 pb-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
          <NavMain items={navigationData.navMain} />
        </div>

        <div>
          <div className="px-3 pb-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Monitoring
          </div>
          <NavSecondary items={navigationData.navMonitoring} />
        </div>

        <div className="mt-auto">
          <div className="px-3 pb-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Administration
          </div>
          <NavSecondary items={navigationData.navAdministration} />
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/60 pt-2">
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
