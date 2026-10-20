"use client";

import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 min-h-screen">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50 text-xs text-muted-foreground mb-4 z-20">
        <ShieldAlert className="size-3.5 text-primary" />
        <span>Autonomous GitHub Intelligence & Recovery</span>
      </div>

      <h1 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-200 dark:to-white text-3xl md:text-5xl lg:text-7xl font-sans py-2 md:py-6 relative z-20 font-bold tracking-tight max-w-4xl">
        When your project falls behind, your agent gets you back on track.
      </h1>

      <p className="max-w-2xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-300 text-center mb-8 relative z-20">
        ProjectRescue inspects repository health, detects critical path blockers, generates evidence-backed recovery plans, and executes approved fixes safely.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 relative z-20">
        <HoverBorderGradient
          containerClassName="rounded-full"
          className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 font-medium px-4 py-2"
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <span>Launch Dashboard</span>
            <ArrowRight className="size-4" />
          </Link>
        </HoverBorderGradient>

        <Link
          href="/sign-in"
          className="text-sm font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Sign In to Workspace
        </Link>
      </div>
    </BackgroundLines>
  );
}
