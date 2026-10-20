"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { Workflow, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface JobItem {
  id: string;
  type: string;
  target: string;
  status: "completed" | "processing" | "pending" | "failed";
  duration: string;
  updatedAt: string;
  details: string;
}

export default function JobsPage() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  const {
    data: jobs = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.jobs(workspaceId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/jobs`);
      if (!res.ok) throw new Error("Failed to load jobs");
      const data = await res.json();
      return (data.jobs as JobItem[]) || [];
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
              <Workflow className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                Background Jobs &amp; Execution Queue
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Asynchronous GitHub synchronization, AST analysis, and isolated recovery validation tasks.
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
              <CardTitle className="text-base font-medium font-sans">Active &amp; Historical Jobs</CardTitle>
              <Badge variant="outline" className="text-xs font-mono">
                {jobs.length} Monitored
              </Badge>
            </div>
            <CardDescription className="text-xs font-sans text-muted-foreground">
              Long-running operations processed with bounded concurrency to protect API rate limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading && jobs.length === 0 ? (
              <div className="flex items-center justify-center p-16 text-xs text-muted-foreground font-mono">
                <RefreshCw className="size-4 animate-spin mr-2" />
                Loading job queue...
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 text-xs text-muted-foreground font-mono">
                No background jobs recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border/80">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-muted-foreground text-[11px]">{job.id}</span>
                        <span className="font-semibold text-foreground font-sans">{job.type}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize h-4 px-1.5 ${
                            job.status === "completed"
                              ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "text-amber-600 dark:text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-sans">
                        Target: <span className="text-foreground font-mono font-medium">{job.target}</span> · {job.details}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
                      <span>Duration: {job.duration}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(job.updatedAt).toLocaleTimeString()}
                      </span>
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
