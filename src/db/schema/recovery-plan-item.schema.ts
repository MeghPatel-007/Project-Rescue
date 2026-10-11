import { pgTable, uuid, text, varchar, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { recoveryPlans } from "./recovery-plan.schema";
import { githubIssues } from "./github-issue.schema";
import { approvals } from "./approval.schema";
import { actionExecutions } from "./action-execution.schema";

export const recoveryPlanItems = pgTable(
  "recovery_plan_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => recoveryPlans.id, { onDelete: "cascade" }),
    issueId: uuid("issue_id").references(() => githubIssues.id, { onDelete: "set null" }),
    orderIndex: integer("order_index").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    actionType: varchar("action_type", { length: 100 }).notNull(), // 'reassign' | 'add_comment' | 'close_issue' | 'update_labels' | 'split_task' | 'create_pr' | 'escalate'
    actionPayload: jsonb("action_payload").$type<Record<string, unknown>>().notNull().default({}),
    status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'failed' | 'skipped'
    requiresApproval: boolean("requires_approval").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("recovery_plan_items_plan_order_idx").on(table.planId, table.orderIndex),
    index("recovery_plan_items_issue_idx").on(table.issueId),
    index("recovery_plan_items_status_idx").on(table.status),
  ],
);

export const recoveryPlanItemsRelations = relations(recoveryPlanItems, ({ one, many }) => ({
  plan: one(recoveryPlans, {
    fields: [recoveryPlanItems.planId],
    references: [recoveryPlans.id],
  }),
  issue: one(githubIssues, {
    fields: [recoveryPlanItems.issueId],
    references: [githubIssues.id],
  }),
  approvals: many(approvals),
  actionExecutions: many(actionExecutions),
}));

export type RecoveryPlanItem = typeof recoveryPlanItems.$inferSelect;
export type NewRecoveryPlanItem = typeof recoveryPlanItems.$inferInsert;
