import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { ShieldAlert, Terminal, GitBranch, Cpu, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About — ProjectRescue",
  description: "Deterministic graph scheduling meets structured LLM reasoning for safe, verified repository recovery.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-foreground selection:text-background">
      <LandingNavbar />
      <main className="flex-1">
        {/* Header Hero */}
        <section className="border-b border-border/80 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-muted/60 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground" />
              <span>Engineering Philosophy</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-foreground leading-[1.08]">
              Certainty over guesswork. <br />
              <span className="text-muted-foreground font-light">Engineered for real codebases.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
              ProjectRescue was created to solve a pervasive problem in modern software development:
              failing CI builds, tangled dependency blocker cycles, and unverified AI code generators that
              introduce hallucinated regressions instead of verifiable solutions.
            </p>
          </div>
        </section>

        {/* Core Principles */}
        <section className="container mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 border-b border-border/80 space-y-12">
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Architectural Invariants
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
              Built on mathematical graphs and human review.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            <div className="space-y-3 p-6 rounded-xl border border-border bg-card">
              <div className="size-8 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground font-mono">
                <Terminal className="size-4" />
              </div>
              <h3 className="text-base font-medium text-foreground">Deterministic Scheduling</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Before any remediation code is formulated, an in-memory directed acyclic graph (DAG) topologically orders
                prerequisite dependencies. We prove absence of cycles before suggesting execution schedules.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-xl border border-border bg-card">
              <div className="size-8 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground font-mono">
                <Lock className="size-4" />
              </div>
              <h3 className="text-base font-medium text-foreground">Two-Phase Human Sign-off</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No autonomous code generation tool should push directly to protected branches or auto-merge pull requests.
                Every mutating action requires explicit, two-phase affirmative human verification.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-xl border border-border bg-card">
              <div className="size-8 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground font-mono">
                <Cpu className="size-4" />
              </div>
              <h3 className="text-base font-medium text-foreground">Bounded LLM Reasoning</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                LLM invocations are constrained to structured Zod schemas with strict validation. AI is a consumer of
                backend APIs, never an unchecked authorization boundary.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-xl border border-border bg-card">
              <div className="size-8 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground font-mono">
                <ShieldAlert className="size-4" />
              </div>
              <h3 className="text-base font-medium text-foreground">Auditable Provenance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every webhook event, diagnostic run, approval decision, and patch creation is recorded in an immutable
                PostgreSQL audit trail linked directly to verifiable Git commit SHAs.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/dashboard">
              <Button size="sm" className="font-mono text-xs h-8 px-4 shadow-none">
                <GitBranch className="size-3.5 mr-1.5" /> Launch Console
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="sm" variant="outline" className="font-mono text-xs h-8 px-4 shadow-none">
                Contact Team
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
