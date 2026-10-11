import { pgTable, uuid, text, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { recoveryPlanItems } from "./recovery-plan-item.schema";
import { user } from "./auth-schema";
import { actionExecutions } from "./action-execution.schema";

export const approvals = pgTable(
  "approvals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planItemId: uuid("plan_item_id")
      .notNull()
      .references(() => recoveryPlanItems.id, { onDelete: "cascade" }),
    requestedById: text("requested_by_id").references(() => user.id, { onDelete: "set null" }),
    decisionById: text("decision_by_id").references(() => user.id, { onDelete: "set null" }),
    status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'approved' | 'rejected' | 'revoked'
    decisionNote: text("decision_note"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
  },
  (table) => [
    index("approvals_plan_item_idx").on(table.planItemId),
    index("approvals_status_requested_idx").on(table.status, table.requestedAt),
    index("approvals_decision_by_idx").on(table.decisionById),
  ],
);

export const approvalsRelations = relations(approvals, ({ one, many }) => ({
  planItem: one(recoveryPlanItems, {
    fields: [approvals.planItemId],
    references: [recoveryPlanItems.id],
  }),
  requestedBy: one(user, {
    fields: [approvals.requestedById],
    references: [user.id],
    relationName: "approvalRequestedBy",
  }),
  decisionBy: one(user, {
    fields: [approvals.decisionById],
    references: [user.id],
    relationName: "approvalDecisionBy",
  }),
  actionExecutions: many(actionExecutions),
}));

export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;
