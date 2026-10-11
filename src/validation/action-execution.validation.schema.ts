import { z } from "zod";

export const executeActionSchema = z.object({
  planItemId: z.string().uuid("Invalid plan item ID"),
  approvalId: z.string().uuid("Invalid approval ID").optional(),
  idempotencyKey: z.string().min(1, "Idempotency key is required").max(255),
  executedBy: z.enum(["system", "agent", "manual"]).default("system"),
  executionPayload: z.record(z.string(), z.unknown()).optional(),
});

export type ExecuteActionInput = z.infer<typeof executeActionSchema>;
