import { db } from "@/db";
import {
  actionExecutions,
  recoveryPlanItems,
  approvals,
  NewActionExecution,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export const actionExecutionRepository = {
  /**
   * Safe execution entry with idempotency key and approval verification
   */
  async recordExecutionStart(
    data: Omit<NewActionExecution, "id" | "status" | "attempts" | "result" | "errorMessage" | "startedAt" | "completedAt" | "createdAt">,
  ) {
    // 1. Check idempotency: if execution with this key exists, return existing
    const [existing] = await db
      .select()
      .from(actionExecutions)
      .where(eq(actionExecutions.idempotencyKey, data.idempotencyKey));

    if (existing) {
      return { isDuplicate: true, execution: existing };
    }

    // 2. Verify approval if approvalId is provided
    if (data.approvalId) {
      const [approval] = await db
        .select()
        .from(approvals)
        .where(eq(approvals.id, data.approvalId));

      if (!approval || approval.status !== "approved") {
        throw new Error("Execution refused: The associated action has not been approved.");
      }
    }

    // 3. Insert running execution
    const [execution] = await db
      .insert(actionExecutions)
      .values({
        ...data,
        status: "running",
        attempts: 1,
        startedAt: new Date(),
      })
      .returning();

    // Mark plan item as in_progress
    await db
      .update(recoveryPlanItems)
      .set({
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(recoveryPlanItems.id, data.planItemId));

    return { isDuplicate: false, execution };
  },

  async recordExecutionSuccess(
    executionId: string,
    resultPayload: Record<string, unknown>,
  ) {
    const [completed] = await db
      .update(actionExecutions)
      .set({
        status: "succeeded",
        result: resultPayload,
        completedAt: new Date(),
      })
      .where(eq(actionExecutions.id, executionId))
      .returning();

    if (completed) {
      await db
        .update(recoveryPlanItems)
        .set({
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(recoveryPlanItems.id, completed.planItemId));
    }

    return completed;
  },

  async recordExecutionFailure(executionId: string, errorMessage: string) {
    const [failed] = await db
      .update(actionExecutions)
      .set({
        status: "failed",
        errorMessage,
        completedAt: new Date(),
      })
      .where(eq(actionExecutions.id, executionId))
      .returning();

    if (failed) {
      await db
        .update(recoveryPlanItems)
        .set({
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(recoveryPlanItems.id, failed.planItemId));
    }

    return failed;
  },
};
