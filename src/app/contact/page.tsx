import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { Mail, MessageSquare, Terminal, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Contact — ProjectRescue",
  description: "Connect with the ProjectRescue engineering team for architecture reviews, pilots, and enterprise deployment.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-foreground selection:text-background">
      <LandingNavbar />
      <main className="flex-1">
        <section className="border-b border-border/80 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-muted/60 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground" />
              <span>Engineering Support</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-foreground leading-[1.08]">
              Talk with our engineers.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground font-sans leading-relaxed max-w-2xl">
              Have questions about multi-tenant isolation, GitHub webhook signatures, or deploying ProjectRescue
              inside private VPC environments? We are here to help.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 border-b border-border/80">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5 space-y-6 font-mono text-xs text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium text-sm font-sans">
                  <Mail className="size-4" /> Direct Communication
                </div>
                <p className="font-sans leading-relaxed text-muted-foreground">
                  Our core team answers technical inquiries regarding repository DAG solvers and custom AST adapters.
                </p>
                <div className="text-foreground pt-1">engineering@projectrescue.local</div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/70">
                <div className="flex items-center gap-2 text-foreground font-medium text-sm font-sans">
                  <Terminal className="size-4" /> Enterprise Security Audits
                </div>
                <p className="font-sans leading-relaxed text-muted-foreground">
                  Need SOC2 compliance mappings or isolated on-premise execution sandbox configurations?
                </p>
                <div className="text-foreground pt-1">security@projectrescue.local</div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/70">
                <div className="flex items-center gap-2 text-foreground font-medium text-sm font-sans">
                  <GitBranch className="size-4" /> GitHub Marketplace
                </div>
                <p className="font-sans leading-relaxed text-muted-foreground">
                  Standard OAuth installations require zero manual keys and can be authorized in seconds.
                </p>
              </div>
            </div>

            <div className="md:col-span-7">
              <form className="rounded-xl border border-border bg-card p-7 space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name" className="text-xs font-sans">Name</Label>
                  <Input id="contact-name" placeholder="Linus Torvalds" className="h-8 text-xs font-sans" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-email" className="text-xs font-sans">Work Email</Label>
                  <Input id="contact-email" type="email" placeholder="linus@kernel.org" className="h-8 text-xs font-sans" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-subject" className="text-xs font-sans">Topic</Label>
                  <Input id="contact-subject" placeholder="Private GitHub App integration query" className="h-8 text-xs font-sans" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-xs font-sans">Message</Label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Details about your repository recovery needs or infrastructure..."
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-sans outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 text-foreground"
                    required
                  />
                </div>

                <Button type="submit" className="w-full text-xs font-mono h-8 shadow-none gap-2">
                  <MessageSquare className="size-3.5" />
                  <span>Send Message</span>
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
