import {
  LandingNavbar,
  HeroSection,
  ProductPreview,
  BentoGridFeatures,
  WorkflowSection,
  SecuritySection,
  LandingFooter,
} from "@/features/landing";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-foreground selection:text-background">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <ProductPreview />
        <BentoGridFeatures />
        <WorkflowSection />
        <SecuritySection />
      </main>
      <LandingFooter />
    </div>
  );
}
