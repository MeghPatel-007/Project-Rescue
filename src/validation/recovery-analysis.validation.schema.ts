import { z } from "zod";

export const recoveryIssueStateSchema = z.enum(["open", "closed"]);
export const issueCriticalitySchema = z.enum(["low", "medium", "high", "critical"]);

export const recoveryIssueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255),
  state: recoveryIssueStateSchema,
  criticality: issueCriticalitySchema.default("medium"),
  assigneeCount: z.number().int().nonnegative().default(0),
  labels: z.array(z.string().min(1)).default([]),
  updatedAt: z.coerce.date(),
  estimatedHours: z.number().positive().optional(),
  releaseRequired: z.boolean().default(false),
});

export const recoveryDependencySchema = z.object({
  blockingIssueId: z.string().min(1),
  blockedIssueId: z.string().min(1),
  dependencyType: z.enum(["blocks", "relates_to", "parent_child"]).default("blocks"),
  confidence: z.number().int().min(0).max(100).default(100),
});

export const recoveryAnalysisInputSchema = z.object({
  issues: z.array(recoveryIssueSchema).min(1),
  dependencies: z.array(recoveryDependencySchema).default([]),
  analyzedAt: z.coerce.date().optional(),
  staleAfterDays: z.number().positive().default(7),
});

// Use input types at the transport boundary so callers may rely on Zod's
// defaults and date coercion. The service works with the normalized output.
export type RecoveryAnalysisInput = z.input<typeof recoveryAnalysisInputSchema>;
export type RecoveryDependencyInput = z.output<typeof recoveryDependencySchema>;
export type RecoveryIssueInput = z.output<typeof recoveryIssueSchema>;
