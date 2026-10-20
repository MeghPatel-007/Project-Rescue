"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight, GitBranch } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-background">
      {/* Final Call to Action banner */}
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 border-b border-border/80">
        <div className="rounded-xl border border-border/80 bg-card p-10 md:p-16 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Get Started
          </div>
          <h2 className="text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            Restore engineering velocity with confidence.
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground font-sans leading-relaxed">
            Connect your repository, let ProjectRescue trace task dependencies, and turn blocking failures into verified
            remediation plans with two-phase human review.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto gap-2 font-mono text-xs h-11 px-6 shadow-none">
                <GitBranch className="size-4" />
                <span>Connect GitHub Repository</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-mono text-xs h-11 px-6 shadow-none">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded border border-border/80 bg-muted/40 flex items-center justify-center text-foreground">
            <ShieldAlert className="size-3.5" />
          </div>
          <span className="font-semibold text-foreground font-sans">ProjectRescue</span>
          <span>· Developer Repository Intelligence</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Overview
          </Link>
          <Link href="/repositories" className="hover:text-foreground transition-colors">
            Repositories
          </Link>
          <Link href="/findings" className="hover:text-foreground transition-colors">
            Findings
          </Link>
          <Link href="/recovery-plans" className="hover:text-foreground transition-colors">
            Recovery Plans
          </Link>
          <Link href="/settings/integrations" className="hover:text-foreground transition-colors">
            Integrations
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>

        <div>
          <span>© 2026 ProjectRescue</span>
        </div>
      </div>
    </footer>
  );
}
