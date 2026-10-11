import { z } from "zod";

export const connectProjectSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace ID"),
  githubInstallationId: z.string().uuid("Invalid GitHub installation ID").optional(),
  name: z.string().min(1).max(255),
  repoOwner: z.string().min(1).max(255),
  repoName: z.string().min(1).max(255),
  githubRepoId: z.number().int().positive(),
  defaultBranch: z.string().min(1).max(100).default("main"),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(["active", "archived", "paused"]).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  version: z.number().int().positive().describe("Expected version for optimistic concurrency"),
});

export const syncProjectSchema = z.object({
  trigger: z.enum(["manual", "webhook", "scheduled", "agent"]).default("manual"),
});

export type ConnectProjectInput = z.infer<typeof connectProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SyncProjectInput = z.infer<typeof syncProjectSchema>;
