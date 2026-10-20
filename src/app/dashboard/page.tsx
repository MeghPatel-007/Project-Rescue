"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  SummaryCards,
  HealthTrendChart,
  FindingsDistributionChart,
  RecoveryActivityChart,
  NeedsAttentionQueue,
  RecentActivityFeed,
  DataTable,
} from "@/features/dashboard";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { GitBranch, RefreshCw, Plus, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";
import fallbackData from "./mock-dashboard-metrics.json";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface WorkspaceMetrics {
  totalProjects: number;
  openIssues: number;
  openPrs: number;
  totalBlockers: number;
  activeRecoveryPlans: number;
  averageHealthScore: number;
  lastActivityAt: string | null;
  failingChecksCount: number;
  findingsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  pendingRecoveryReviews: number;
  healthTrend: Array<{ date: string; healthScore: number; blockers: number }>;
  findingsDistribution: Array<{ severity: string; count: number; fill: string }>;
  recoveryActivity: Array<{ date: string; proposed: number; approved: number; completed: number }>;
  attentionItems: Array<{
    id: string;
    type: "blocker" | "finding" | "plan";
    title: string;
    repoName: string;
    severity: string;
    updatedAt: string;
    link: string;
  }>;
}

interface ConnectedProject {
  id: string;
  name: string;
  repoOwner: string;
  repoName: string;
  defaultBranch: string;
  status: string;
  healthScore: number | null;
  openIssuesCount: number;
  openPrsCount: number;
  blockersCount: number;
  lastSyncedAt: string | null;
}

interface ActivityEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  createdAt: string;
  details: Record<string, unknown> | null;
}

export default function DashboardPage() {
  const { currentWorkspace, isLoading: isWorkspaceLoading, getWorkspaceUrl } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const queryClient = useQueryClient();

  const {
    data: metricsData,
    isFetching: isMetricsFetching,
  } = useQuery({
    queryKey: queryKeys.dashboardMetrics(workspaceId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/metrics`);
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();
      return (data.metrics as WorkspaceMetrics) || null;
    },
    enabled: Boolean(workspaceId),
    placeholderData: (prev) => prev,
  });

  const {
    data: projectsData,
    isFetching: isProjectsFetching,
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

  const {
    data: activityData,
    isFetching: isActivityFetching,
  } = useQuery({
    queryKey: queryKeys.activity(workspaceId || "", 10),
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/activity`);
      if (!res.ok) throw new Error("Failed to fetch activity");
      const data = await res.json();
      return (data.events as ActivityEvent[]) || [];
    },
    enabled: Boolean(workspaceId),
    placeholderData: (prev) => prev,
  });

  const metrics = metricsData ?? null;
  const projects = React.useMemo(() => projectsData ?? [], [projectsData]);
  const activityEvents = React.useMemo(() => activityData ?? [], [activityData]);
  const isRefreshing = isMetricsFetching || isProjectsFetching || isActivityFetching;

  const handleRefresh = React.useCallback(async () => {
    if (!workspaceId) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) }),
    ]);
  }, [queryClient, workspaceId]);

  const tableData = React.useMemo(() => {
    if (projects.length === 0) {
      return fallbackData.slice(0, 8);
    }
    return projects.map((p, idx) => ({
      id: idx + 1,
      header: `${p.repoOwner}/${p.repoName}`,
      type: "Repository",
      status: p.blockersCount > 0 ? "Has Blockers" : "Healthy",
      target: `${p.openIssuesCount} issues`,
      limit: `${p.blockersCount} blockers`,
      reviewer: p.repoOwner,
    }));
  }, [projects]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Workspace Context & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Building2 className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                {isWorkspaceLoading ? "Loading Workspace..." : currentWorkspace?.name || "Workspace Overview"}
              </h1>
              {currentWorkspace && (
                <span className="text-[11px] px-2 py-0.5 rounded-md border border-border bg-muted/40 font-mono text-muted-foreground">
                  {currentWorkspace.slug} · {currentWorkspace.role}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Continuous diagnostics, failing check detection, and AI recovery pipeline status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-1.5 h-8 text-xs font-mono shadow-none"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
            </Button>
            <Link href={getWorkspaceUrl("/repositories")}>
              <Button size="sm" className="gap-1.5 h-8 text-xs font-mono shadow-none">
                <Plus className="size-3.5" />
                <span>Connect Repo</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. Summary Cards */}
        <SummaryCards
          totalProjects={metrics?.totalProjects ?? projects.length}
          failingChecksCount={metrics?.failingChecksCount ?? metrics?.totalBlockers ?? 0}
          openFindings={
            metrics?.findingsBySeverity ?? {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
              total: metrics?.openIssues ?? 0,
            }
          }
          pendingRecoveryReviews={metrics?.pendingRecoveryReviews ?? metrics?.activeRecoveryPlans ?? 0}
        />

        {/* 2. Primary Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HealthTrendChart data={metrics?.healthTrend || []} />
          </div>
          <div>
            <FindingsDistributionChart data={metrics?.findingsDistribution || []} />
          </div>
        </div>

        {/* 3. Operational Row: Recovery Velocity & Needs-Attention Queue */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecoveryActivityChart data={metrics?.recoveryActivity || []} />
          <NeedsAttentionQueue items={metrics?.attentionItems || []} />
        </div>

        {/* 4. Table & Recent Activity Feed */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
                <GitBranch className="size-4 text-primary" />
                <span>Monitored Repositories &amp; Recovery Items</span>
              </h2>
              <Link
                href={getWorkspaceUrl("/repositories")}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
              >
                <span>Manage all</span>
                <ExternalLink className="size-3" />
              </Link>
            </div>
            <DataTable data={tableData} />
          </div>
          <div>
            <RecentActivityFeed events={activityEvents} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
