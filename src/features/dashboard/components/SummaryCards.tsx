"use client";

import * as React from "react";
import Link from "next/link";
import { GitBranch, ShieldAlert, LifeBuoy, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/providers/WorkspaceProvider";

export interface SummaryCardsProps {
  totalProjects: number;
  failingChecksCount: number;
  openFindings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  pendingRecoveryReviews: number;
}

export function SummaryCards({
  totalProjects,
  failingChecksCount,
  openFindings,
  pendingRecoveryReviews,
}: SummaryCardsProps) {
  const { getWorkspaceUrl } = useWorkspace();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Connected Repositories */}
      <Link
        href={getWorkspaceUrl("/repositories")}
        className="group relative flex flex-col justify-between rounded-lg border border-border/80 bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-muted/30"
      >
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-mono uppercase tracking-wider">Connected Repos</span>
          <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground font-mono">{totalProjects}</span>
          <span className="text-xs text-muted-foreground font-mono">active</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <GitBranch className="size-3.5 text-primary" />
          <span>Continuous GitHub telemetry</span>
        </div>
      </Link>

      {/* 2. Failing CI Checks / Blockers */}
      <Link
        href={getWorkspaceUrl("/findings?severity=critical")}
        className="group relative flex flex-col justify-between rounded-lg border border-border/80 bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-muted/30"
      >
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-mono uppercase tracking-wider">Failing Checks / Blockers</span>
          <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span
            className={`text-3xl font-bold tracking-tight font-mono ${
              failingChecksCount > 0 ? "text-destructive" : "text-emerald-500"
            }`}
          >
            {failingChecksCount}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {failingChecksCount > 0 ? "require triage" : "clean pass"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldAlert className="size-3.5 text-destructive" />
          <span>Release-blocking bottlenecks</span>
        </div>
      </Link>

      {/* 3. Open Findings */}
      <Link
        href={getWorkspaceUrl("/findings")}
        className="group relative flex flex-col justify-between rounded-lg border border-border/80 bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-muted/30"
      >
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-mono uppercase tracking-wider">Open Findings</span>
          <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
            {openFindings.total}
          </span>
          <div className="flex items-center gap-1">
            {openFindings.critical > 0 && (
              <Badge variant="destructive" className="h-4 px-1 text-[10px] font-mono">
                {openFindings.critical} C
              </Badge>
            )}
            {openFindings.high > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] font-mono bg-amber-500/15 text-amber-500">
                {openFindings.high} H
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertTriangle className="size-3.5 text-amber-500" />
          <span>Ranked by topological risk</span>
        </div>
      </Link>

      {/* 4. Recovery Plans Awaiting Review */}
      <Link
        href={getWorkspaceUrl("/recovery-plans")}
        className="group relative flex flex-col justify-between rounded-lg border border-border/80 bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-muted/30"
      >
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-mono uppercase tracking-wider">Pending Approvals</span>
          <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
            {pendingRecoveryReviews}
          </span>
          <span className="text-xs text-muted-foreground font-mono">plans</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <LifeBuoy className="size-3.5 text-primary" />
          <span>2-phase human verification gate</span>
        </div>
      </Link>
    </div>
  );
}
