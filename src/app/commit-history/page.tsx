"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { GitCommit, GitBranch, ExternalLink, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface CommitItem {
  id: string;
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  authorAvatar?: string;
  date: string;
  repoName: string;
  repoOwner: string;
  url: string;
}

export default function CommitHistoryPage() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  const {
    data: commits = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.commits(workspaceId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/commits`);
      if (!res.ok) throw new Error("Failed to fetch commits");
      const data = await res.json();
      return (data.commits as CommitItem[]) || [];
    },
    enabled: Boolean(workspaceId),
    placeholderData: (prev) => prev,
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitCommit className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                Commit History &amp; Provenance
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Attribution and cryptographic provenance for commits across monitored repositories in workspace{" "}
              <span className="font-mono text-foreground">{currentWorkspace?.name || "..."}</span>.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 h-8 text-xs font-mono shadow-none"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border/70">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium font-sans">Repository Commits</CardTitle>
              <Badge variant="outline" className="text-xs font-mono">
                {commits.length} Tracked
              </Badge>
            </div>
            <CardDescription className="text-xs font-sans text-muted-foreground">
              Chronological tree of commits mapped to recovery tasks and patch executions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading && commits.length === 0 ? (
              <div className="flex items-center justify-center p-16 text-xs text-muted-foreground font-mono">
                <RefreshCw className="size-4 animate-spin mr-2" />
                Querying GitHub commit log...
              </div>
            ) : commits.length === 0 ? (
              <div className="text-center py-16 text-xs text-muted-foreground font-mono">
                No commits found. Connect a repository to index its commit history.
              </div>
            ) : (
              <div className="divide-y divide-border/80">
                {commits.map((commit) => (
                  <div
                    key={commit.sha}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] px-2 py-0.5 rounded-md border border-border/80 bg-muted/40 font-semibold text-foreground">
                          {commit.shortSha}
                        </span>
                        <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                          <GitBranch className="size-3 text-foreground" />
                          {commit.repoOwner}/{commit.repoName}
                        </span>
                        <span className="text-muted-foreground text-[11px] font-sans">by {commit.author}</span>
                      </div>
                      <p className="font-medium text-foreground text-xs font-sans truncate max-w-xl">
                        {commit.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" />
                        {new Date(commit.date).toLocaleDateString()}
                      </span>
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Button size="sm" variant="ghost" className="h-7 px-2">
                          <ExternalLink className="size-3" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
