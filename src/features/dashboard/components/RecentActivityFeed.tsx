"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, Clock, Bot, User, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWorkspace } from "@/providers/WorkspaceProvider";

export interface ActivityEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  createdAt: string;
  details: Record<string, unknown> | null;
}

export function RecentActivityFeed({ events }: { events: ActivityEvent[] }) {
  const { getWorkspaceUrl } = useWorkspace();

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <span>Recent Workspace Activity &amp; Audit Trail</span>
          </CardTitle>
          <Link
            href={getWorkspaceUrl("/activity")}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
          >
            <span>View all</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <CardDescription className="text-xs">
          Immutable event log distinguishing automated AI pipeline runs from human gate approvals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground font-mono">
            No activity events recorded yet. Connect a repository to start logging.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.slice(0, 6).map((evt) => {
              const isAi = evt.action.startsWith("ai.") || evt.action.startsWith("recovery_plan.");
              const isApproval = evt.action.startsWith("approval.");

              return (
                <div key={evt.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-6 rounded-md border flex items-center justify-center shrink-0 bg-muted/40">
                      {isAi ? (
                        <Bot className="size-3 text-indigo-400" />
                      ) : isApproval ? (
                        <CheckCircle2 className="size-3 text-emerald-500" />
                      ) : (
                        <User className="size-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-medium text-foreground">{evt.action}</span>
                        <Badge variant="outline" className="text-[10px] font-mono h-4 px-1">
                          {evt.entityType}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate font-mono">
                        Target: {evt.entityId.slice(0, 16)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-[11px] font-mono shrink-0">
                    <Clock className="size-3" />
                    <span>{new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
