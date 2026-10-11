import { z } from "zod";

export const recoveryPlanItemActionTypeSchema = z.enum([
  "reassign",
  "add_comment",
  "close_issue",
  "update_labels",
  "split_task",
  "create_pr",
  "escalate",
]);

export const createRecoveryPlanItemSchema = z.object({
  issueId: z.string().uuid("Invalid issue ID").optional(),
  orderIndex: z.number().int().nonnegative(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  actionType: recoveryPlanItemActionTypeSchema,
  actionPayload: z.record(z.string(), z.unknown()).default({}),
  requiresApproval: z.boolean().default(true),
});

export const createRecoveryPlanSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  assumptions: z.union([z.array(z.string()), z.record(z.string(), z.unknown())]).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
  items: z.array(createRecoveryPlanItemSchema).min(1, "Plan must have at least one item"),
});

export type CreateRecoveryPlanInput = z.infer<typeof createRecoveryPlanSchema>;
export type CreateRecoveryPlanItemInput = z.infer<typeof createRecoveryPlanItemSchema>;
