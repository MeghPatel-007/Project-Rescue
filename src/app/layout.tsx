import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WorkspaceProvider } from "@/providers/WorkspaceProvider";
import { QueryProvider } from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectRescue — AI-Powered GitHub Intelligence & Project Recovery",
  description:
    "Autonomous GitHub repository intelligence, blocker analysis, and evidence-backed recovery planning with human approval gates.",
  keywords: [
    "GitHub intelligence",
    "repository recovery",
    "AI software engineering",
    "dependency blocker detection",
    "automated code recovery",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
         <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <WorkspaceProvider>
                {children}
              </WorkspaceProvider>
            </QueryProvider>
          </ThemeProvider>
          </TooltipProvider>
        </body>
    </html>
  );
}
