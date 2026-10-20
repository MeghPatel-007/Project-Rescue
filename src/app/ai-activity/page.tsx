"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { Cpu, Bot, Clock, GitCommit, FileCode, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AgentEvent {
  id: string;
  module: string;
  tool: string;
  repo: string;
  commitSha?: string;
  filesChanged: string[];
  status: "completed" | "running" | "suggested";
  duration: string;
  timestamp: string;
  summary: string;
}

const mockAgentEvents: AgentEvent[] = [
  {
    id: "run-904",
    module: "TopologicalGraphSolver",
    tool: "resolve_execution_schedule",
    repo: "org-rescue/core-api",
    commitSha: "8b3f12a",
    filesChanged: ["src/proxy.ts", "package.json"],
    status: "completed",
    duration: "340ms",
    timestamp: "10 minutes ago",
    summary: "Built directed acyclic graph of issues and failing checks. Verified acyclic remediation ordering.",
  },
  {
    id: "run-903",
    module: "CodeRemediationAgent",
    tool: "synthesize_patch_diff",
    repo: "org-rescue/core-api",
    commitSha: "4f9b2d8",
    filesChanged: ["src/proxy.ts"],
    status: "completed",
    duration: "1.1s",
    timestamp: "28 minutes ago",
    summary: "Constructed deterministic patch for edge cookie session reader. Staged for human verification.",
  },
  {
    id: "run-902",
    module: "IssueDiagnosticParser",
    tool: "parse_check_suite_telemetry",
    repo: "org-rescue/core-api",
    commitSha: "2c7e911",
    filesChanged: ["github/workflows/ci.yml"],
    status: "completed",
    duration: "210ms",
    timestamp: "1 hour ago",
    summary: "Extracted failure traceback from GitHub Actions check_suite #419. Pinpointed timeout condition.",
  },
  {
    id: "run-901",
    module: "DependencyAuditor",
    tool: "detect_lockfile_conflicts",
    repo: "org-rescue/web-client",
    commitSha: "1a9d45e",
    filesChanged: ["package.json", "bun.lock"],
    status: "completed",
    duration: "450ms",
    timestamp: "3 hours ago",
    summary: "Scanned 14 upstream dependencies for breaking semver ranges. Zero transitive cycles detected.",
  },
];

export default function AiActivityPage() {
  const { currentWorkspace } = useWorkspace();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                AI Activity &amp; Diagnostic Trace
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Immutable telemetry of AI agent reasoning runs, structured tool invocations, and patch proposals in workspace{" "}
              <span className="font-mono text-foreground">{currentWorkspace?.name || "..."}</span>.
            </p>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border/70">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium font-sans">Agent Reasoning Timeline</CardTitle>
              <Badge variant="outline" className="text-xs font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Deterministic Runtime
              </Badge>
            </div>
            <CardDescription className="text-xs font-sans text-muted-foreground">
              Every AI operation is bounded, validated against runtime Zod schemas, and committed to PostgreSQL audit tables.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/80">
              {mockAgentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground text-[11px]">{evt.id}</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 font-sans">
                        <Bot className="size-3.5 text-foreground" />
                        {evt.module}
                      </span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {evt.tool}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 h-4 px-1.5"
                      >
                        {evt.status}
                      </Badge>
                      {evt.commitSha && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <GitCommit className="size-3 text-foreground" />
                          <span>{evt.commitSha}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">{evt.summary}</p>
                    <div className="flex items-center gap-2 pt-0.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileCode className="size-3" />
                        {evt.filesChanged.join(", ")}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Schema Validated
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
                    <span>Latency: {evt.duration}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {evt.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
