"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import {
  GitBranch,
  GitPullRequest,
  RefreshCw,
  Plus,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Lock,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface ConnectedProject {
  id: string;
  workspaceId: string;
  name: string;
  repoOwner: string;
  repoName: string;
  githubRepoId: number;
  defaultBranch: string;
  status: string;
  healthScore: number | null;
  openIssuesCount: number;
  openPrsCount: number;
  blockersCount: number;
  lastSyncedAt: string | null;
  createdAt: string;
}

interface AvailableRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  description: string | null;
  htmlUrl: string;
  isConnected: boolean;
  projectId?: string;
}

export default function RepositoriesPage() {
  const { currentWorkspace, getWorkspaceUrl } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const queryClient = useQueryClient();

  const {
    data: projects = [],
    isLoading: loading,
  } = useQuery({
    queryKey: queryKeys.projects(workspaceId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      return (data.projects as ConnectedProject[]) || [];
    },
    enabled: Boolean(workspaceId),
    placeholderData: (prev) => prev,
  });

  const [isSyncing, setIsSyncing] = React.useState(false);
  const [filterQuery, setFilterQuery] = React.useState("");

  // Connect dialog state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [availableRepos, setAvailableRepos] = React.useState<AvailableRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = React.useState(false);
  const [repoSearch, setRepoSearch] = React.useState("");
  const [connectingId, setConnectingId] = React.useState<number | null>(null);
  const [connectError, setConnectError] = React.useState<string | null>(null);

  const handleOpenConnectModal = async () => {
    if (!currentWorkspace?.id) return;
    setIsModalOpen(true);
    setConnectError(null);
    setLoadingRepos(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/github/repos`);
      if (res.ok) {
        const data = await res.json();
        setAvailableRepos(data.repositories || []);
      } else {
        const err = await res.json();
        setConnectError(err.error || "Failed to load GitHub repositories");
      }
    } catch {
      setConnectError("Could not reach GitHub API. Ensure GitHub is connected in Settings > Integrations.");
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleConnectRepo = async (repo: AvailableRepo) => {
    if (!currentWorkspace?.id) return;
    setConnectingId(repo.id);
    setConnectError(null);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: repo.owner,
          repoName: repo.name,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setConnectError(err.error || "Failed to connect repository");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.projects(currentWorkspace.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics(currentWorkspace.id) });
      setIsModalOpen(false);
    } catch {
      setConnectError("An error occurred while connecting the repository");
    } finally {
      setConnectingId(null);
    }
  };

  const handleSyncAll = async () => {
    if (!currentWorkspace?.id || projects.length === 0) return;
    setIsSyncing(true);
    try {
      await Promise.all(
        projects.map((p) =>
          fetch(`/api/workspaces/${currentWorkspace.id}/projects/${p.id}/sync`, { method: "POST" }),
        ),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects(currentWorkspace.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics(currentWorkspace.id) });
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async (projectId: string) => {
    if (!currentWorkspace?.id) return;
    if (!confirm("Are you sure you want to disconnect this repository from the workspace?")) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.projects(currentWorkspace.id) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics(currentWorkspace.id) });
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  const visibleProjects = projects.filter((p) =>
    `${p.repoOwner}/${p.repoName}`.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredRepos = availableRepos.filter((r) =>
    r.fullName.toLowerCase().includes(repoSearch.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                Connected Repositories
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Monitored repositories in workspace{" "}
              <span className="font-mono text-foreground">{currentWorkspace?.name || "..."}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncAll}
              disabled={isSyncing || projects.length === 0}
              className="gap-1.5 h-8 text-xs font-mono shadow-none"
            >
              <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync All"}</span>
            </Button>
            <Button size="sm" onClick={handleOpenConnectModal} className="gap-1.5 h-8 text-xs font-mono shadow-none">
              <Plus className="size-3.5" />
              <span>Connect Repository</span>
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        {projects.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
              <Input
                placeholder="Filter repositories..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-8 text-xs font-mono h-8 rounded-md"
              />
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              {visibleProjects.length} of {projects.length} repositories
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-16 text-xs text-muted-foreground font-mono">
            <RefreshCw className="size-4 animate-spin mr-2" />
            Loading workspace repositories...
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="mx-auto flex size-12 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground mb-4">
              <GitBranch className="size-5" />
            </div>
            <h3 className="text-base font-medium mb-1 text-foreground">No repositories connected yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6 font-sans leading-relaxed">
              Connect a repository from your GitHub account to enable AI blocker detection, dependency graph analysis,
              and automated recovery planning.
            </p>
            <Button onClick={handleOpenConnectModal} className="gap-2 text-xs font-mono h-8 shadow-none">
              <Plus className="size-3.5" />
              <span>Connect GitHub Repository</span>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleProjects.map((repo) => (
              <Card key={repo.id} className="flex flex-col justify-between border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                      <GitBranch className="size-3.5 text-foreground" />
                      <span>{repo.repoOwner}</span>
                    </div>
                    {repo.blockersCount > 0 ? (
                      <Badge variant="destructive" className="gap-1 text-[10px]">
                        <ShieldAlert className="size-3" />
                        <span>{repo.blockersCount} Blockers</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                        <CheckCircle2 className="size-3" />
                        <span>Health: {repo.healthScore ?? 100}%</span>
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-medium font-sans">{repo.repoName}</CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Default branch: <span className="text-foreground font-semibold">{repo.defaultBranch}</span> ·{" "}
                    {repo.lastSyncedAt
                      ? `Synced ${new Date(repo.lastSyncedAt).toLocaleTimeString()}`
                      : "Not yet synced"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-2 text-xs bg-muted/30 p-2.5 rounded-md border border-border/70 font-mono">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Issues</span>
                      <span className="font-medium text-foreground">{repo.openIssuesCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">PRs</span>
                      <span className="font-medium text-foreground">{repo.openPrsCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Blockers</span>
                      <span className={`font-medium ${repo.blockersCount > 0 ? "text-destructive" : "text-foreground"}`}>
                        {repo.blockersCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-2 border-t border-border/70 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <Link
                      href={getWorkspaceUrl(`/recovery-plans?repo=${repo.repoName}`)}
                      className="text-xs text-foreground hover:underline font-medium flex items-center gap-1"
                    >
                      <GitPullRequest className="size-3.5" />
                      <span>Recovery Plans</span>
                    </Link>
                    <a
                      href={`https://github.com/${repo.repoOwner}/${repo.repoName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(repo.id)}
                    className="text-muted-foreground hover:text-destructive h-7 px-2"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Connect Repository Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-card w-full max-w-xl rounded-xl p-6 border border-border flex flex-col max-h-[85vh] font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-medium font-sans text-foreground">Connect GitHub Repository</h3>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5">
                    Select a repository from your GitHub account to connect to {currentWorkspace?.name}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="h-7 w-7 p-0">
                  ✕
                </Button>
              </div>

              {connectError && (
                <div className="mt-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                  {connectError}
                </div>
              )}

              <div className="my-4 relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Filter repositories..."
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  className="pl-8 text-xs font-mono h-8 rounded-md"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px]">
                {loadingRepos ? (
                  <div className="flex items-center justify-center h-48 text-xs text-muted-foreground">
                    <RefreshCw className="size-4 animate-spin mr-2" />
                    Fetching repositories from GitHub...
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground font-sans">
                    No repositories found matching your filter.
                  </div>
                ) : (
                  filteredRepos.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-md border border-border/80 bg-background/50 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs truncate text-foreground">{r.fullName}</span>
                          {r.isPrivate && <Lock className="size-3 text-muted-foreground shrink-0" />}
                        </div>
                        {r.description && (
                          <p className="text-[11px] text-muted-foreground truncate max-w-md font-sans mt-0.5">{r.description}</p>
                        )}
                        <span className="text-[10px] text-muted-foreground">Branch: {r.defaultBranch}</span>
                      </div>
                      <div>
                        {r.isConnected ? (
                          <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            Connected
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            disabled={connectingId === r.id}
                            onClick={() => handleConnectRepo(r)}
                            className="text-xs h-7 px-3 shadow-none font-mono"
                          >
                            {connectingId === r.id ? "Connecting..." : "Connect"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="text-xs font-mono h-8">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
