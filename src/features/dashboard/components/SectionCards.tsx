"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitBranch, ShieldAlert, GitPullRequest, Activity } from "lucide-react";

export interface SectionCardsProps {
  totalProjects?: number;
  openIssues?: number;
  openPrs?: number;
  totalBlockers?: number;
  activeRecoveryPlans?: number;
  averageHealthScore?: number;
}

export function SectionCards({
  totalProjects = 0,
  openIssues = 0,
  openPrs = 0,
  totalBlockers = 0,
  activeRecoveryPlans = 0,
  averageHealthScore = 100,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* 1. Connected Repositories */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Connected Repositories</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalProjects}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-primary">
              <GitBranch className="size-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 font-medium text-xs">
            {totalProjects > 0 ? "Continuous monitoring active" : "No repositories connected"}
          </div>
          <div className="text-muted-foreground text-xs">Monitored in current workspace</div>
        </CardFooter>
      </Card>

      {/* 2. Detected Blockers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Detected Blockers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalBlockers}
          </CardTitle>
          <CardAction>
            <Badge
              variant={totalBlockers > 0 ? "destructive" : "outline"}
              className={totalBlockers === 0 ? "text-emerald-500 border-emerald-500/30" : ""}
            >
              <ShieldAlert className="size-3" />
              {totalBlockers > 0 ? "Requires Action" : "Clear"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 font-medium text-xs">
            {totalBlockers > 0 ? `${totalBlockers} issues blocking releases` : "Zero blocking bottlenecks"}
          </div>
          <div className="text-muted-foreground text-xs">Critical path analysis</div>
        </CardFooter>
      </Card>

      {/* 3. Open Issues & Pull Requests */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Open Issues & PRs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {openIssues + openPrs}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-xs">
              <GitPullRequest className="size-3" />
              {openPrs} PRs
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 font-medium text-xs">
            {openIssues} issues · {openPrs} pull requests
          </div>
          <div className="text-muted-foreground text-xs">Synced from GitHub API</div>
        </CardFooter>
      </Card>

      {/* 4. Health & Recovery Plans */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Health & Recovery</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {averageHealthScore}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/30">
              <Activity className="size-3" />
              {activeRecoveryPlans} Plans
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 font-medium text-xs">
            {activeRecoveryPlans > 0 ? `${activeRecoveryPlans} plans pending execution` : "Repository healthy"}
          </div>
          <div className="text-muted-foreground text-xs">Evidence-backed confidence</div>
        </CardFooter>
      </Card>
    </div>
  );
}
