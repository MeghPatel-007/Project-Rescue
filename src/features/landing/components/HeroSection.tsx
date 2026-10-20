"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ArrowRight,
  GitBranch,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Activity,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative border-b border-border/80 pt-16 pb-20 md:pt-24 md:pb-32 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Taito-inspired Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-7 text-left">
            <div className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-muted/60 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground" />
              <span>AI-powered repository recovery</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-foreground leading-[1.04]">
              Broken code. <br />
              <span className="text-muted-foreground font-light">Clear path forward.</span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
              Understand repository failures, identify issues, and generate safe recovery plans with AI.
              Review every change before it reaches your codebase.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto gap-2 font-mono text-xs h-11 px-6 shadow-none">
                  <GitBranch className="size-4" />
                  <span>Connect GitHub</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="#workflow">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-mono text-xs h-11 px-6 shadow-none">
                  <span>Explore Workflow</span>
                </Button>
              </Link>
            </div>

            {/* Micro-Trust Signals */}
            <div className="pt-6 border-t border-border/70 flex items-center gap-6 text-xs font-mono text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-foreground" /> Least-privilege OAuth
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-foreground" /> Human approval gated
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-foreground" /> No auto-merging
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Application Preview */}
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 font-mono">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-border/70 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full border border-border bg-muted" />
                    <span className="size-2.5 rounded-full border border-border bg-muted" />
                    <span className="size-2.5 rounded-full border border-border bg-muted" />
                  </div>
                  <span className="text-muted-foreground text-[11px] ml-2 font-mono">
                    projectrescue.internal/workspace/core-api
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] gap-1 h-5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                  <Activity className="size-3" /> 92% Health
                </Badge>
              </div>

              {/* Status Header Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md border border-border/80 p-2.5 bg-muted/30">
                  <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Monitored</span>
                  <span className="text-lg font-medium text-foreground">3 Repos</span>
                </div>
                <div className="rounded-md border border-border/80 p-2.5 bg-muted/30">
                  <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Blockers</span>
                  <span className="text-lg font-medium text-destructive">1 Critical</span>
                </div>
                <div className="rounded-md border border-border/80 p-2.5 bg-muted/30">
                  <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Pending Gate</span>
                  <span className="text-lg font-medium text-amber-600 dark:text-amber-400">1 Plan</span>
                </div>
              </div>

              {/* Live Blocker Alert Card */}
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-destructive font-semibold flex items-center gap-1.5 font-sans">
                    <AlertTriangle className="size-3.5" /> Failing CI Suite #1042
                  </span>
                  <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                    Critical Blocker
                  </Badge>
                </div>
                <p className="text-muted-foreground text-[11px] font-sans">
                  Timeout in auth proxy cascade blocking PR #48 merging to production.
                </p>
              </div>

              {/* Staged Recovery Diff */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span className="flex items-center gap-1">
                    <FileCode className="size-3" /> Staged Recovery Patch
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Awaiting Human Sign-off</span>
                </div>
                <pre className="rounded-md border border-border/80 bg-muted/30 p-3 text-[11px] text-foreground leading-relaxed overflow-x-auto">
                  <code>{`--- a/src/proxy.ts\n+++ b/src/proxy.ts\n@@ -8,3 +8,3 @@\n- const session = await auth.getSession();\n+ const session = getSessionCookie(request);\n+ response.cookies.set("active_workspace", id);`}</code>
                </pre>
              </div>

              {/* Human Gate Sign-off Row */}
              <div className="pt-2 flex items-center justify-between border-t border-border/70 text-xs">
                <span className="text-muted-foreground text-[11px]">Two-Phase Verification Required</span>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                    Approve Patch
                  </span>
                  <span className="px-2.5 py-1 rounded-md border border-border bg-card text-muted-foreground text-[11px]">
                    Reject
                  </span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground/80">
                <span className="flex items-center gap-1">
                  <Terminal className="size-3" /> Illustrative demo preview
                </span>
                <span>Branch: rescue/fix-proxy-timeout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
