"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { Activity, Clock, Terminal, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface AuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  createdAt: string;
  details: Record<string, unknown> | null;
}

export default function ActivityPage() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  const {
    data: events = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.activity(workspaceId || "", 50),
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/activity`);
      if (!res.ok) throw new Error("Failed to load audit events");
      const data = await res.json();
      return (data.events as AuditEvent[]) || [];
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
              <Activity className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                Audit Trail &amp; Governance Log
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Immutable PostgreSQL trace of workspace events, human approvals, and GitHub side effects for{" "}
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
              <CardTitle className="text-base font-medium font-sans">Event Stream</CardTitle>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                PostgreSQL Append-Only
              </Badge>
            </div>
            <CardDescription className="text-xs font-sans text-muted-foreground">
              Chronological log of workspace actions recorded in `audit_events`.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading && events.length === 0 ? (
              <div className="flex items-center justify-center p-16 text-xs text-muted-foreground font-mono">
                <RefreshCw className="size-4 animate-spin mr-2" />
                Loading audit trail...
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16 text-xs text-muted-foreground font-mono">
                No recorded audit events for this workspace yet. Connect a repository or modify workspace settings to begin logging.
              </div>
            ) : (
              <div className="divide-y divide-border/80">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground text-xs">{event.action}</span>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {event.entityType}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-[11px] flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Terminal className="size-3 text-muted-foreground" /> ID: {event.entityId}
                        </span>
                        {event.details && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-sm text-foreground/75 font-sans">
                              {JSON.stringify(event.details)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px] shrink-0">
                      <Clock className="size-3" />
                      <span>{new Date(event.createdAt).toLocaleString()}</span>
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
