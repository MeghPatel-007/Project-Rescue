"use client";

import React from "react";
import { Lock, KeyRound, ShieldCheck, Server, Eye, Terminal } from "lucide-react";

export function SecuritySection() {
  return (
    <section id="security" className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-b border-border/80">
      <div className="mb-14 space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Security &amp; Governance Invariants
        </div>
        <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          Human-in-the-loop by design. Zero autonomous overwrites.
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl font-sans">
          ProjectRescue is strictly governed. AI agents are consumers of backend services, never the authorization
          boundary.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-foreground font-medium text-sm">
            <div className="size-7 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground">
              <Lock className="size-3.5" />
            </div>
            <span>Two-Phase Human Gate</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            Every mutating operation (creating review branches, modifying issues, publishing PRs) requires explicit human
            confirmation.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-foreground font-medium text-sm">
            <div className="size-7 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground">
              <KeyRound className="size-3.5" />
            </div>
            <span>Least-Privilege Scoping</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            Never paste personal access tokens. ProjectRescue uses short-lived tokens scoped exclusively to authorized
            repositories.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-foreground font-medium text-sm">
            <div className="size-7 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground">
              <ShieldCheck className="size-3.5" />
            </div>
            <span>Protected Branch Invariant</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            Safety guarantees prevent pushing directly to `main` or `master`. All fixes are published via reviewable
            pull requests.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-foreground font-medium text-sm">
            <div className="size-7 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground">
              <Server className="size-3.5" />
            </div>
            <span>Isolated Sandboxing</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            Untrusted repository code and test suites execute in ephemeral isolated environments, never on the production
            API server.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-foreground font-medium text-sm">
            <div className="size-7 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground">
              <Eye className="size-3.5" />
            </div>
            <span>Observable Diff Inspection</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            Inspect line-level file changes, dependency adjustments, and test outcomes before committing anything to Git.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-foreground font-medium text-sm">
            <div className="size-7 rounded-md border border-border/80 bg-muted/40 flex items-center justify-center text-foreground">
              <Terminal className="size-3.5" />
            </div>
            <span>Append-Only Audit Trail</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            Every AI proposal, human approval, webhook delivery, and synchronization run is cryptographically logged in
            PostgreSQL.
          </p>
        </div>
      </div>
    </section>
  );
}
