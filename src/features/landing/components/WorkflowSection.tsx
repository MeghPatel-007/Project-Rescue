"use client";

import React from "react";
import {
  GitBranch,
  Search,
  AlertTriangle,
  LifeBuoy,
  FileCode,
  ShieldCheck,
} from "lucide-react";

const workflowSteps = [
  {
    step: "01",
    title: "Connect a GitHub Repository",
    description:
      "Authorize your organization with granular, least-privilege OAuth. Select specific repositories for ProjectRescue to monitor.",
    icon: GitBranch,
  },
  {
    step: "02",
    title: "Analyze Repository Health & Failures",
    description:
      "The engine continuously maps issue dependencies, parses check suite telemetry, and flags critical-path bottlenecks.",
    icon: Search,
  },
  {
    step: "03",
    title: "Identify & Prioritize Findings",
    description:
      "Findings are ranked topologically by severity, blast radius, and blocker impact so teams resolve upstream impediments first.",
    icon: AlertTriangle,
  },
  {
    step: "04",
    title: "Generate a Recovery Plan",
    description:
      "AI formulates a deterministic, multi-step recovery sequence with structured validation steps and estimated effort.",
    icon: LifeBuoy,
  },
  {
    step: "05",
    title: "Review Proposed Code Changes",
    description:
      "Inspect syntax-highlighted monospace diffs and pre-execution validation checks in a safe, sandboxed preview.",
    icon: FileCode,
  },
  {
    step: "06",
    title: "Approve & Publish Changes",
    description:
      "Execute changes via explicit two-phase sign-off. ProjectRescue opens reviewed PRs to dedicated branches without touching protected branches.",
    icon: ShieldCheck,
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-b border-border/80">
      <div className="mb-14 space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Operational Lifecycle
        </div>
        <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          Six steps from broken build to verified recovery.
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl font-sans">
          A disciplined, observable sequence designed to restore engineering velocity with zero unreviewed side effects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {workflowSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.step}
              className="rounded-xl border border-border/80 bg-card p-6 flex flex-col justify-between space-y-5 transition-colors hover:border-foreground/30"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="size-8 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{step.step}</span>
                </div>
                <h3 className="font-sans font-medium text-base text-foreground tracking-tight">{step.title}</h3>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
