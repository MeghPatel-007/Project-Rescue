import { z } from "zod";

export const requestApprovalSchema = z.object({
  planItemId: z.string().uuid("Invalid plan item ID"),
  requestedById: z.string().optional(),
});

export const decideApprovalSchema = z.object({
  approvalId: z.string().uuid("Invalid approval ID"),
  decision: z.enum(["approved", "rejected"]),
  decisionNote: z.string().max(1000).optional(),
});

export type RequestApprovalInput = z.infer<typeof requestApprovalSchema>;
export type DecideApprovalInput = z.infer<typeof decideApprovalSchema>;
