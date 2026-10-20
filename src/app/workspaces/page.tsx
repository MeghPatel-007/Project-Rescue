"use client";

import * as React from "react";
import { Building2, Plus, ShieldCheck, Users, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";

interface WorkspaceRecord {
  workspace: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
  };
  membership: {
    role: "owner" | "admin" | "member" | "viewer";
    joinedAt: string;
  };
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const [refreshIndex, setRefreshIndex] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    fetch("/api/workspaces")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load workspaces");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setWorkspaces(data.workspaces || []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Error loading workspaces");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [refreshIndex]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create workspace");
      }

      setIsModalOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      setRefreshIndex((prev) => prev + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating workspace");
    } finally {
      setSubmitting(false);
    }
  };

  const { switchWorkspace } = useWorkspace();
  const selectWorkspace = (workspaceId: string) => {
    switchWorkspace(workspaceId);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                Workspaces
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Multi-tenant workspace isolation, member permissions, and repository scoping.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-1.5 h-8 text-xs font-mono shadow-none">
            <Plus className="size-3.5" />
            <span>New Workspace</span>
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-mono text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-48 bg-muted/30 border-border" />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <div className="border border-border bg-muted/40 text-foreground p-3 rounded-md mb-4">
              <Building2 className="size-6" />
            </div>
            <CardTitle className="mb-1 text-base font-medium font-sans">No workspaces found</CardTitle>
            <CardDescription className="max-w-md mb-6 text-xs font-sans">
              Workspaces isolate your GitHub repositories and recovery plans. Create your first workspace to get started.
            </CardDescription>
            <Button onClick={() => setIsModalOpen(true)} className="text-xs font-mono h-8 shadow-none">
              Create Workspace
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map(({ workspace, membership }) => (
              <Card key={workspace.id} className="flex flex-col justify-between border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={membership.role === "owner" ? "default" : "secondary"} className="capitalize text-[10px] font-mono">
                      <ShieldCheck className="size-3 mr-1" />
                      {membership.role}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">{workspace.slug}</span>
                  </div>
                  <CardTitle className="text-base font-medium font-sans">{workspace.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs font-sans">
                    {workspace.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1 font-mono pt-0">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/70 flex justify-between gap-2 font-mono text-xs">
                  <Link
                    href={`/settings/members?workspaceId=${workspace.id}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                  >
                    <Users className="size-3.5" /> Members
                  </Link>
                  <Link
                    href={`/dashboard?workspaceId=${workspace.id}`}
                    onClick={() => selectWorkspace(workspace.id)}
                  >
                    <Button size="sm" variant="outline" className="h-7 text-xs font-mono shadow-none">
                      <span>Open</span>
                      <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-mono">
            <div className="bg-card w-full max-w-md rounded-xl p-6 border border-border">
              <h3 className="text-base font-medium font-sans mb-1 text-foreground">Create New Workspace</h3>
              <p className="text-xs text-muted-foreground font-sans mb-4">
                Enter a name and unique identifier for your team or organization.
              </p>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Workspace Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "-")
                            .replace(/-+/g, "-")
                            .slice(0, 30),
                        );
                      }
                    }}
                    placeholder="e.g. Core Engineering"
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug" className="text-xs">Slug (URL-friendly)</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    placeholder="core-engineering"
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Primary services and recovery workflows"
                    className="text-xs h-8"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="text-xs h-8"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="text-xs h-8 shadow-none">
                    {submitting ? "Creating..." : "Create Workspace"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
