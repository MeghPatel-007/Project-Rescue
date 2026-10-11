import { db } from "@/db";
import {
  approvals,
  recoveryPlanItems,
  NewApproval,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export const approvalRepository = {
  /**
   * Request approval for a plan item
   */
  async requestApproval(data: Omit<NewApproval, "id" | "status" | "requestedAt" | "decidedAt" | "decisionNote">) {
    const [approval] = await db
      .insert(approvals)
      .values({
        ...data,
        status: "pending",
      })
      .returning();

    return approval;
  },

  /**
   * Record decision on an approval (approve or reject)
   */
  async decideApproval(
    approvalId: string,
    decisionUserId: string,
    decision: "approved" | "rejected",
    decisionNote?: string,
  ) {
    const [updatedApproval] = await db
      .update(approvals)
      .set({
        status: decision,
        decisionById: decisionUserId,
        decisionNote,
        decidedAt: new Date(),
      })
      .where(eq(approvals.id, approvalId))
      .returning();

    if (!updatedApproval) {
      throw new Error(`Approval record with id ${approvalId} not found.`);
    }

    // Update parent plan item status accordingly
    const newPlanItemStatus = decision === "approved" ? "approved" : "rejected";
    await db
      .update(recoveryPlanItems)
      .set({
        status: newPlanItemStatus,
        updatedAt: new Date(),
      })
      .where(eq(recoveryPlanItems.id, updatedApproval.planItemId));

    return updatedApproval;
  },

  async findById(id: string) {
    const [approval] = await db.select().from(approvals).where(eq(approvals.id, id));
    return approval ?? null;
  },

  async findPendingByPlanItem(planItemId: string) {
    const [approval] = await db
      .select()
      .from(approvals)
      .where(eq(approvals.planItemId, planItemId));
    return approval ?? null;
  },
};
