"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { Settings2, Bot, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const [customName, setCustomName] = React.useState<string | null>(null);
  const [aiModel] = React.useState("gemini-2.5-pro");
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const workspaceName = customName !== null ? customName : (currentWorkspace?.name || "");

  const handleSave = async () => {
    if (!currentWorkspace?.id || !workspaceName) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });

      if (!res.ok) {
        const err = await res.json();
        setFeedback({ type: "error", message: err.error || "Failed to update workspace" });
        return;
      }

      await refreshWorkspaces();
      setCustomName(null);
      setFeedback({ type: "success", message: "Workspace updated successfully" });
    } catch {
      setFeedback({ type: "error", message: "Network error occurred while saving" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                Workspace Settings
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Manage general configuration, AI model parameters, and workspace preferences for{" "}
              <span className="font-mono text-foreground">{currentWorkspace?.name || "..."}</span>.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-md text-xs font-mono flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {feedback.type === "success" ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-base font-medium font-sans flex items-center gap-2">
                <Settings2 className="size-4 text-foreground" /> Workspace Details
              </CardTitle>
              <CardDescription className="text-xs font-sans text-muted-foreground">Primary profile and workspace metadata.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="ws-name" className="text-xs font-sans">Workspace Name</Label>
                <Input
                  id="ws-name"
                  value={workspaceName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="text-xs font-sans h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-slug" className="text-xs font-sans">Workspace Slug</Label>
                <Input id="ws-slug" value={currentWorkspace?.slug || ""} disabled className="font-mono text-xs h-8 bg-muted/30" />
              </div>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="text-xs font-mono h-8 shadow-none">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-base font-medium font-sans flex items-center gap-2">
                <Bot className="size-4 text-foreground" /> AI Provider &amp; Model
              </CardTitle>
              <CardDescription className="text-xs font-sans text-muted-foreground">Orchestration layer configuration.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="ai-model" className="text-xs font-sans">Selected Engine</Label>
                <Input
                  id="ai-model"
                  value={aiModel}
                  disabled
                  className="font-mono text-xs h-8 bg-muted/30"
                />
              </div>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                Configured with structured JSON schema outputs and mathematical cycle-detection verification.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
