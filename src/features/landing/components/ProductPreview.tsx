"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  GitCommit,
  GitBranch,
  ShieldCheck,
  ArrowRight,
  Clock,
  Layers,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductPreview() {
  return (
    <section id="preview" className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-b border-border/80">
      {/* Section Header */}
      <div className="mb-12 space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Platform Architecture Preview
        </div>
        <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          From failing check suites to deterministic recovery.
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl font-sans">
          ProjectRescue continuously parses CI logs, maps dependency chains, and synthesizes evidence-backed
          remediation sequences with two-phase human sign-off.
        </p>
        <div className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-muted/40 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Terminal className="size-3.5" />
          <span>Interactive preview · Production runtime executes against authorized GitHub installations</span>
        </div>
      </div>

      {/* Main Terminal Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden font-mono">
        {/* Terminal Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-border/80 bg-muted/30 px-4 py-3 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full border border-border bg-muted" />
              <span className="size-2.5 rounded-full border border-border bg-muted" />
              <span className="size-2.5 rounded-full border border-border bg-muted" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-foreground">
              <GitBranch className="size-3.5 text-muted-foreground" />
              <span className="font-semibold">enterprise-core / api-service</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">branch:</span>
              <span className="rounded border border-border/80 bg-muted/60 px-1.5 py-0.5 text-foreground text-[11px]">
                main
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3" /> Synced 2m ago
            </span>
            <Badge variant="destructive" className="text-[10px] uppercase font-mono">
              1 Critical Blocker
            </Badge>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/80">
          {/* Column 1: CI Health & Failed Checks */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-foreground" /> Workflow Diagnostics
              </h3>
              <span className="text-[11px] text-destructive font-mono font-medium">Failed CI Suite #419</span>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-destructive font-sans">
                  <span className="flex items-center gap-1.5">
                    <XCircle className="size-3.5 shrink-0" /> auth-proxy-timeout
                  </span>
                  <span className="font-mono text-[10px]">exit code 1</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                  Session lookup cascade timed out on edge middleware without fallback token reader.
                </p>
              </div>

              <div className="rounded-md border border-border/70 bg-muted/30 p-2.5 text-xs flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground font-sans">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" /> lint &amp; typecheck
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">passed (2.8s)</span>
              </div>

              <div className="rounded-md border border-border/70 bg-muted/30 p-2.5 text-xs flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground font-sans">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" /> schema-validation
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">passed (1.4s)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Graph Analysis & Root Cause Findings */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" /> Blocker Analysis
              </h3>
              <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                Confidence 96%
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-border/80 bg-background/50 p-3.5 text-xs space-y-2">
                <div className="font-semibold text-foreground flex items-center justify-between font-sans">
                  <span>Root Blocker: Issue #104</span>
                  <Badge variant="destructive" className="text-[10px]">P0 Critical</Badge>
                </div>
                <p className="text-muted-foreground text-[11px] font-sans leading-relaxed">
                  Unmigrated auth token lookup blocks PR #48 (&quot;Workspace RBAC&quot;) and PR #52 (&quot;Audit Ingestion&quot;).
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-muted-foreground">
                  <GitCommit className="size-3 text-foreground" />
                  <span>Evidence: commit 4f9b2d8 &amp; CI Log #419</span>
                </div>
              </div>

              <div className="rounded-md border border-border/80 bg-background/50 p-3.5 text-xs space-y-1.5 font-sans">
                <div className="font-semibold text-foreground flex items-center justify-between">
                  <span>Blast Radius: 2 PRs Blocked</span>
                  <Badge variant="secondary" className="text-[10px]">Release Impact</Badge>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Fixing the edge cookie reader unblocks the critical path with zero downstream breaking changes.
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Generated Recovery Plan */}
          <div className="p-5 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-foreground" /> Proposed Recovery Plan
              </h3>
              <span className="text-[11px] font-mono text-foreground font-medium">Plan #RP-204</span>
            </div>

            <div className="space-y-2">
              <div className="rounded-md border border-border/80 bg-card p-3 text-xs space-y-1 font-sans">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-foreground">Step 1: Edge Cookie Verification</span>
                  <Badge variant="outline" className="text-[9px]">P0 · 15m</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Apply deterministic patch to `src/proxy.ts` using `getSessionCookie(request)`.
                </p>
              </div>

              <div className="rounded-md border border-border/80 bg-card p-3 text-xs space-y-1 font-sans">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-foreground">Step 2: Add Composite Index</span>
                  <Badge variant="outline" className="text-[9px]">P1 · 10m</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ensure migration 0002 has composite index on `(workspace_id, user_id)`.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70">
              <div className="flex items-center justify-between mb-2 text-[11px] text-muted-foreground font-mono">
                <span>Requires Human Sign-off</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Tests Passed</span>
              </div>
              <Button size="sm" className="w-full gap-1.5 text-xs font-mono h-8 shadow-none">
                <span>Review &amp; Authorize Plan</span>
                <ArrowRight className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
