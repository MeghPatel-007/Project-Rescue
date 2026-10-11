import { db } from "@/db";
import {
  recoveryPlans,
  recoveryPlanItems,
  NewRecoveryPlan,
  NewRecoveryPlanItem,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const recoveryPlanRepository = {
  /**
   * Create a recovery plan with plan items
   */
  async createPlanWithItems(
    planData: Omit<NewRecoveryPlan, "id" | "version" | "createdAt" | "updatedAt">,
    itemsData: Array<Omit<NewRecoveryPlanItem, "id" | "planId" | "createdAt" | "updatedAt">>,
  ) {
    // Determine next version number for this project
    const [latestPlan] = await db
      .select({ version: recoveryPlans.version })
      .from(recoveryPlans)
      .where(eq(recoveryPlans.projectId, planData.projectId))
      .orderBy(desc(recoveryPlans.version))
      .limit(1);

    const nextVersion = (latestPlan?.version ?? 0) + 1;

    // Insert plan
    const [createdPlan] = await db
      .insert(recoveryPlans)
      .values({
        ...planData,
        version: nextVersion,
      })
      .returning();

    // Insert plan items
    const insertedItems = [];
    if (itemsData.length > 0) {
      const itemsToInsert = itemsData.map((item) => ({
        ...item,
        planId: createdPlan.id,
      }));
      const items = await db.insert(recoveryPlanItems).values(itemsToInsert).returning();
      insertedItems.push(...items);
    }

    return {
      plan: createdPlan,
      items: insertedItems,
    };
  },

  async findById(id: string) {
    const [plan] = await db.select().from(recoveryPlans).where(eq(recoveryPlans.id, id));
    if (!plan) return null;

    const items = await db
      .select()
      .from(recoveryPlanItems)
      .where(eq(recoveryPlanItems.planId, id));

    return { ...plan, items };
  },

  async findByProjectId(projectId: string) {
    return db
      .select()
      .from(recoveryPlans)
      .where(eq(recoveryPlans.projectId, projectId))
      .orderBy(desc(recoveryPlans.version));
  },
};
