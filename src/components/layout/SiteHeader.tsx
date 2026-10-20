"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/layout/ThemeToggle";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

const routeTitleMap: Record<string, { section: string; title: string }> = {
  "/dashboard": { section: "Workspace", title: "Overview" },
  "/repositories": { section: "Workspace", title: "Repositories" },
  "/findings": { section: "Workspace", title: "Findings" },
  "/recovery-plans": { section: "Workspace", title: "Recovery Plans" },
  "/jobs": { section: "Workspace", title: "Background Jobs" },
  "/ai-activity": { section: "Monitoring", title: "AI Activity" },
  "/commit-history": { section: "Monitoring", title: "Commit History" },
  "/activity": { section: "Monitoring", title: "Audit Trail" },
  "/workspaces": { section: "Administration", title: "Workspaces" },
  "/settings/integrations": { section: "Administration", title: "Integrations" },
  "/settings/members": { section: "Administration", title: "Team Members" },
  "/settings": { section: "Administration", title: "Settings" },
};

export function SiteHeader() {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();

  const currentRoute = routeTitleMap[pathname] || {
    section: "Platform",
    title: pathname.replace(/^\//, "").split("/")[0] || "Console",
  };

  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-md transition-colors lg:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1 size-8 rounded-md hover:bg-muted" />
        <Separator orientation="vertical" className="h-4 border-border" />

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground min-w-0">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none"
          >
            {currentWorkspace?.name || "Workspace"}
          </Link>
          <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" />
          <span className="text-muted-foreground/80 hidden sm:inline">{currentRoute.section}</span>
          <ChevronRight className="size-3 shrink-0 text-muted-foreground/60 hidden sm:inline" />
          <span className="font-semibold text-foreground truncate">{currentRoute.title}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/70 bg-card text-[11px] font-mono text-muted-foreground">
          <ShieldCheck className="size-3.5 text-foreground" />
          <span>Two-Phase Gate</span>
          <span className="size-1.5 rounded-full bg-emerald-500 ml-0.5 animate-pulse" />
        </div>
        <ModeToggle className="size-8 rounded-md" />
      </div>
    </header>
  );
}
