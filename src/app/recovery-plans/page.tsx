"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import {
  LifeBuoy,
  CheckCircle2,
  XCircle,
  Check,
  X,
  FileCode,
  RefreshCw,
  GitBranch,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface PlanItem {
  id: string;
  orderIndex: number;
  title: string;
  description: string | null;
  actionType: string;
  status: string;
  requiresApproval: boolean;
  diffSnippet?: string;
  approvalId?: string;
}

interface RecoveryPlan {
  id: string;
  projectId: string;
  repoOwner: string;
  repoName: string;
  title: string;
  description: string | null;
  version: number;
  status: string;
  riskLevel: string;
  createdAt: string;
  items: PlanItem[];
}

export function DiffViewer({ snippet }: { snippet?: string }) {
  const content = snippet || `--- a/package.json\n+++ b/package.json\n@@ -24,3 +24,3 @@\n- "broken-lib": "^1.0.0"\n+ "broken-lib": "^1.2.4"`;
  const lines = content.split("\n");

  return (
    <div className="rounded-md border border-border/80 bg-muted/30 overflow-hidden font-mono text-[11px]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/70 bg-card/60 text-muted-foreground text-[10px]">
        <div className="flex items-center gap-1.5">
          <FileCode className="size-3 text-foreground" />
          <span>Unified Monospace Diff</span>
        </div>
        <span>Two-Phase Review Gate</span>
      </div>
      <div className="p-3 overflow-x-auto leading-relaxed">
        {lines.map((line, idx) => {
          let lineClass = "text-muted-foreground";
          if (line.startsWith("+") && !line.startsWith("+++")) {
            lineClass = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 -mx-3 px-3 py-0.5 block";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            lineClass = "text-destructive bg-destructive/10 -mx-3 px-3 py-0.5 block";
          } else if (line.startsWith("@@")) {
            lineClass = "text-amber-600 dark:text-amber-400 -mx-3 px-3 py-0.5 block font-semibold";
          }
          return (
            <div key={idx} className={lineClass}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RecoveryPlansPage() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const queryClient = useQueryClient();

  const {
    data: plans = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.recoveryPlans(workspaceId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/recovery-plans`);
      if (!res.ok) throw new Error("Failed to load recovery plans");
      const data = await res.json();
      return (data.plans as RecoveryPlan[]) || [];
    },
    enabled: Boolean(workspaceId),
    placeholderData: (prev) => prev,
  });

  const [decidingId, setDecidingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleDecide = async (planId: string, itemId: string, decision: "approved" | "rejected") => {
    if (!workspaceId) return;
    setDecidingId(itemId);
    setFeedback(null);

    try {
      const endpoint = decision === "approved" ? "approve" : "reject";
      const res = await fetch(`/api/workspaces/${workspaceId}/recovery-plans/${planId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planItemId: itemId }),
      });

      if (res.ok) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.recoveryPlans(workspaceId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics(workspaceId) }),
        ]);
        setFeedback(`Plan item ${decision} successfully.`);
      }
    } catch {
      setFeedback("Failed to record decision. Please retry.");
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LifeBuoy className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                Recovery Plans &amp; Diff Review
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Evidence-backed recovery sequences. All mutating operations require affirmative two-phase human authorization.
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

        {/* Security Invariant Alert */}
        <div className="p-3.5 rounded-lg border border-border bg-card flex items-start gap-3 text-xs text-muted-foreground font-sans">
          <ShieldCheck className="size-4 text-foreground shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-medium text-foreground">Human Approval Gate Invariant:</span> Proposed code changes,
            dependency adjustments, and pull requests are staged in isolated review branches. Changes are never auto-merged
            or pushed directly to default branches.
          </div>
        </div>

        {feedback && (
          <div className="p-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono text-emerald-600 dark:text-emerald-400">
            {feedback}
          </div>
        )}

        {/* Recovery Plans List */}
        {loading && plans.length === 0 ? (
          <div className="flex items-center justify-center p-16 text-xs text-muted-foreground font-mono">
            <RefreshCw className="size-4 animate-spin mr-2" />
            Loading recovery strategies...
          </div>
        ) : plans.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <LifeBuoy className="size-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-base font-medium text-foreground">No active recovery plans</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 font-sans leading-relaxed">
              When repository sync detects critical dependency blockers or failing checks, AI will synthesize an
              actionable recovery plan for review.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={plan.riskLevel === "high" ? "destructive" : "secondary"}
                        className="text-[10px] uppercase h-4 px-1.5"
                      >
                        {plan.riskLevel} Risk
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        Status: {plan.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <GitBranch className="size-3 text-foreground" />
                        {plan.repoOwner}/{plan.repoName} (v{plan.version})
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Created {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base font-medium font-sans mt-2 text-foreground">{plan.title}</CardTitle>
                  {plan.description && (
                    <CardDescription className="text-xs mt-1 text-muted-foreground font-sans leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Remediation Steps ({plan.items.length})
                  </div>

                  <div className="space-y-4">
                    {plan.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-3 font-mono"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="size-5 rounded-md border border-border/80 bg-card flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-xs font-sans text-foreground">{item.title}</span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              {item.actionType}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.status === "approved" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono border-emerald-500/30 gap-1 h-6">
                                <CheckCircle2 className="size-3" /> Approved
                              </Badge>
                            ) : item.status === "rejected" ? (
                              <Badge variant="destructive" className="text-[10px] font-mono gap-1 h-6">
                                <XCircle className="size-3" /> Rejected
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={decidingId === item.id}
                                  onClick={() => handleDecide(plan.id, item.id, "approved")}
                                  className="h-7 text-xs font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 shadow-none"
                                >
                                  <Check className="size-3" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={decidingId === item.id}
                                  onClick={() => handleDecide(plan.id, item.id, "rejected")}
                                  className="h-7 text-xs font-mono text-destructive border-destructive/30 hover:bg-destructive/10 gap-1 shadow-none"
                                >
                                  <X className="size-3" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-muted-foreground font-sans leading-relaxed pl-7">
                            {item.description}
                          </p>
                        )}

                        {/* Monospace Diff Preview */}
                        <div className="pl-7 pt-1">
                          <DiffViewer snippet={item.diffSnippet} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
