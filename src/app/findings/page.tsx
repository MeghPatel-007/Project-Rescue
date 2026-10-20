"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import {
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GitBranch,
  RefreshCw,
  LifeBuoy,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface FindingItem {
  id: string;
  projectId: string;
  repoOwner: string;
  repoName: string;
  githubIssueId: number;
  issueNumber: number;
  title: string;
  body: string | null;
  state: string;
  criticality: "critical" | "high" | "medium" | "low";
  isBlocked: boolean;
  blockerCount: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

function FindingsContent() {
  const { currentWorkspace, getWorkspaceUrl } = useWorkspace();
  const searchParams = useSearchParams();
  const initialSeverity = searchParams.get("severity") || "all";

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);
  const [severityFilter, setSeverityFilter] = React.useState<string>(initialSeverity);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const workspaceId = currentWorkspace?.id;

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    data: findings = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.findings(workspaceId || "", {
      criticality: severityFilter,
      status: statusFilter,
      search: debouncedSearch,
    }),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/workspaces/${workspaceId}/findings?${params.toString()}`, {
        signal,
      });
      if (!res.ok) throw new Error("Failed to fetch findings");
      const data = await res.json();
      return (data.findings as FindingItem[]) || [];
    },
    enabled: Boolean(workspaceId),
    placeholderData: (prev) => prev,
  });

  const severities = ["all", "critical", "high", "medium", "low"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="size-4 text-foreground" />
            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
              Findings &amp; Diagnostics
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-sans">
            Topological bottlenecks, failing CI checks, and blocker dependencies in workspace{" "}
            <span className="font-mono text-foreground">{currentWorkspace?.name || "..."}</span>
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

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search findings by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs font-mono h-8 rounded-md"
          />
        </div>
        <div className="flex items-center gap-1 border border-border/80 rounded-md p-0.5 bg-muted/40">
          {severities.map((sev) => (
            <Button
              key={sev}
              variant={severityFilter === sev ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSeverityFilter(sev)}
              className="h-7 px-2.5 text-xs font-mono capitalize shadow-none"
            >
              {sev}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1 border border-border/80 rounded-md p-0.5 bg-muted/40">
          {["all", "open", "closed"].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className="h-7 px-2.5 text-xs font-mono capitalize shadow-none"
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      {loading && findings.length === 0 ? (
        <div className="flex items-center justify-center p-16 text-xs text-muted-foreground font-mono">
          <RefreshCw className="size-4 animate-spin mr-2" />
          Analyzing workspace findings...
        </div>
      ) : findings.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <ShieldAlert className="size-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-medium text-foreground">No findings match your criteria</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 font-sans">
            Try adjusting your search terms or severity filter.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {findings.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <Card
                key={item.id}
                className="border-border bg-card transition-colors hover:border-foreground/30"
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap font-mono">
                      <Badge
                        variant={
                          item.criticality === "critical"
                            ? "destructive"
                            : item.criticality === "high"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px] uppercase h-4 px-1.5"
                      >
                        {item.criticality}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <GitBranch className="size-3 text-foreground" />
                        {item.repoOwner}/{item.repoName} #{item.issueNumber}
                      </span>
                      {item.isBlocked && (
                        <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                          Blocker
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <Link href={getWorkspaceUrl(`/recovery-plans?repo=${item.repoName}`)}>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 shadow-none">
                          <LifeBuoy className="size-3" />
                          <span>Recovery Plan</span>
                        </Button>
                      </Link>
                      <a
                        href={`https://github.com/${item.repoOwner}/${item.repoName}/issues/${item.issueNumber}`}
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

                  <CardTitle
                    className="text-base font-medium font-sans mt-2 cursor-pointer hover:text-foreground/80 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.labels.slice(0, 4).map((label) => (
                        <span key={label} className="text-[10px] px-2 py-0.5 rounded border border-border/70 bg-muted/30 font-mono text-muted-foreground">
                          {label}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-xs font-mono text-muted-foreground h-6 px-2 gap-1"
                    >
                      <span>{isExpanded ? "Hide Details" : "Inspect Evidence"}</span>
                      {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border/80 text-xs text-muted-foreground space-y-2.5 bg-muted/20 p-3.5 rounded-md font-mono">
                      <div className="font-medium text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        <span>Diagnostic Context &amp; Payload</span>
                      </div>
                      <p className="whitespace-pre-wrap font-sans text-xs text-foreground/90 leading-relaxed bg-card p-3 rounded-md border border-border/70">
                        {item.body || "No additional body context supplied by GitHub issue report."}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-[11px] border-t border-border/60">
                        <span>Detection Source: GitHub Issue / Action Suite</span>
                        <span>State: <span className="text-foreground font-semibold">{item.state}</span></span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FindingsPage() {
  return (
    <AppShell>
      <React.Suspense fallback={<div className="p-6 text-xs text-muted-foreground font-mono">Loading findings...</div>}>
        <FindingsContent />
      </React.Suspense>
    </AppShell>
  );
}
