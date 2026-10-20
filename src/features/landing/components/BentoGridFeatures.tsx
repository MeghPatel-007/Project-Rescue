"use client";

import React from "react";
import {
  Network,
  Cpu,
  LifeBuoy,
  FileCode,
  CheckCircle2,
  GitCommit,
} from "lucide-react";

interface FeatureItem {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

const features: FeatureItem[] = [
  {
    number: "01",
    title: "Repository Diagnostics",
    description:
      "Constructs an in-memory directed acyclic graph (DAG) of issues, pull requests, and CI workflow runs to pinpoint release bottlenecks with mathematical certainty.",
    icon: Network,
    tags: ["DAG Analysis", "Cycle Detection", "CI Telemetry"],
  },
  {
    number: "02",
    title: "AI-Powered Failure Analysis",
    description:
      "Inspects error traces, failing check suites, and syntax trees to isolate root causes without hallucinating unverified code paths or dependencies.",
    icon: Cpu,
    tags: ["Structured Outputs", "Traceback Parsing", "Root Cause"],
  },
  {
    number: "03",
    title: "Recovery Plan Generation",
    description:
      "Synthesizes an ordered, deterministic remediation sequence prioritizing prerequisite blockers before dependent downstream fixes.",
    icon: LifeBuoy,
    tags: ["Ordered Sequences", "Topological Sort", "Risk Assessment"],
  },
  {
    number: "04",
    title: "Code Diff Review",
    description:
      "Inspects proposed file changes and patches in a clean monospace diff viewer before any write operations are staged or committed.",
    icon: FileCode,
    tags: ["Patch Preview", "Syntax Highlighting", "Blast Radius"],
  },
  {
    number: "05",
    title: "Human Approval & Publishing",
    description:
      "Enforces a two-phase human verification gate for all mutating operations. Never auto-merges or pushes directly to protected branches.",
    icon: CheckCircle2,
    tags: ["Two-Phase Sign-off", "PR Branch Only", "RBAC Enforcement"],
  },
  {
    number: "06",
    title: "AI Activity & Commit Tracking",
    description:
      "Maintains an immutable PostgreSQL audit trail connecting AI reasoning runs and approved patches directly to verifiable Git commit SHAs.",
    icon: GitCommit,
    tags: ["Audit Logs", "Commit Provenance", "Append-Only"],
  },
];

export function BentoGridFeatures() {
  return (
    <section id="features" className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-b border-border/80">
      <div className="mb-14 space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Platform Architecture
        </div>
        <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          Engineered for certainty, not AI guesswork.
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl font-sans">
          ProjectRescue integrates deterministic graph scheduling with structured LLM reasoning to ensure all code
          remediation is safe, auditable, and human-verified.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/80 rounded-xl overflow-hidden border border-border/80">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.number} className="bg-card p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="size-9 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground">
                    <Icon className="size-4.5" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{f.number}</span>
                </div>
                <h3 className="font-sans font-medium text-base text-foreground tracking-tight">{f.title}</h3>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-border/60">
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border/70 bg-muted/30 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
