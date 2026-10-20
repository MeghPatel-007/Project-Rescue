"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, LifeBuoy, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWorkspace } from "@/providers/WorkspaceProvider";

export interface AttentionItem {
  id: string;
  type: "blocker" | "finding" | "plan";
  title: string;
  repoName: string;
  severity: string;
  updatedAt: string;
  link: string;
}

export function NeedsAttentionQueue({ items }: { items: AttentionItem[] }) {
  const { getWorkspaceUrl } = useWorkspace();

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="size-4 text-destructive" />
            <span>Needs-Attention Queue</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs font-mono">
            {items.length} Actionable
          </Badge>
        </div>
        <CardDescription className="text-xs">
          High-priority blockers, failing check suites, and recovery proposals awaiting human gate sign-off.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
            <p className="text-sm font-medium">All systems green</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              No failing checks, critical blockers, or pending approvals requiring immediate developer intervention.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-muted-foreground text-[11px]">
                      {item.repoName}
                    </span>
                    <Badge
                      variant={
                        item.severity === "critical"
                          ? "destructive"
                          : item.severity === "high"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] font-mono uppercase h-4 px-1"
                    >
                      {item.severity}
                    </Badge>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {item.updatedAt}
                    </span>
                  </div>
                  <p className="font-medium text-foreground truncate max-w-xl">
                    {item.title}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    href={getWorkspaceUrl(item.link)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {item.type === "plan" ? (
                      <span className="flex items-center gap-1">
                        <LifeBuoy className="size-3.5" /> Review Plan
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        Investigate <ArrowRight className="size-3" />
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
