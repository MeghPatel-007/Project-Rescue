"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useWorkspace } from "@/providers/WorkspaceProvider";
export type { WorkspaceItem } from "@/providers/WorkspaceProvider";

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, isLoading, switchWorkspace, refreshWorkspaces } = useWorkspace();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState("");
  const [newWorkspaceSlug, setNewWorkspaceSlug] = React.useState("");
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName || !newWorkspaceSlug) {
      setCreateError("Name and slug are required");
      return;
    }
    setIsSubmitting(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkspaceName,
          slug: newWorkspaceSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setCreateError(errData.error || "Failed to create workspace");
        setIsSubmitting(false);
        return;
      }

      const { workspace } = await res.json();
      await refreshWorkspaces();
      switchWorkspace(workspace.id);
      setIsCreateOpen(false);
      setNewWorkspaceName("");
      setNewWorkspaceSlug("");
    } catch {
      setCreateError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {isLoading ? "Loading..." : currentWorkspace?.name || "Select Workspace"}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {currentWorkspace ? `${currentWorkspace.slug} (${currentWorkspace.role})` : "No workspace"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">Workspaces</DropdownMenuLabel>
              {workspaces.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => switchWorkspace(w.id)}
                  className="flex items-center gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-medium text-sm">{w.name}</div>
                    <div className="text-muted-foreground text-xs">{w.slug}</div>
                  </div>
                  {currentWorkspace?.id === w.id && <Check className="size-4 text-primary ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 p-2 cursor-pointer"
            >
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium text-sm">Create workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background w-full max-w-md rounded-xl p-6 shadow-xl border">
            <h3 className="text-lg font-semibold mb-2">Create New Workspace</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Workspaces isolate your connected GitHub repositories, analyses, and recovery plans.
            </p>
            {createError && (
              <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <Label htmlFor="ws-name">Workspace Name</Label>
                <Input
                  id="ws-name"
                  placeholder="e.g. Acme Engineering"
                  value={newWorkspaceName}
                  onChange={(e) => {
                    setNewWorkspaceName(e.target.value);
                    if (!newWorkspaceSlug) {
                      setNewWorkspaceSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                          .slice(0, 30),
                      );
                    }
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ws-slug">Workspace Slug (unique identifier)</Label>
                <Input
                  id="ws-slug"
                  placeholder="e.g. acme-engineering"
                  value={newWorkspaceSlug}
                  onChange={(e) => setNewWorkspaceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setCreateError(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarMenu>
  );
}
