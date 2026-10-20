"use client";

import * as React from "react";
import Link from "next/link";
import { GitBranch, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/ThemeToggle";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground group-hover:border-foreground/40 transition-colors">
            <ShieldAlert className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-semibold tracking-tight text-foreground text-sm">ProjectRescue</span>
            <span className="text-[10px] text-muted-foreground font-mono leading-none">Repo Intelligence</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-muted-foreground">
          <Link href="#preview" className="transition-colors hover:text-foreground">
            Platform Preview
          </Link>
          <Link href="#features" className="transition-colors hover:text-foreground">
            Capabilities
          </Link>
          <Link href="#workflow" className="transition-colors hover:text-foreground">
            How It Works
          </Link>
          <Link href="#security" className="transition-colors hover:text-foreground">
            Security & RBAC
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <ModeToggle className="size-8 rounded-md" />
          <Link href="/sign-in" className="hidden sm:inline-block">
            <Button variant="ghost" size="sm" className="text-xs font-mono h-8 px-3">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="gap-1.5 text-xs font-mono h-8 px-3.5 shadow-none">
              <GitBranch className="size-3.5" />
              <span>Connect GitHub</span>
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
