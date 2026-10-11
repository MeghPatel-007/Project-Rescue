import { pgTable, uuid, text, varchar, timestamp, integer, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { approvals } from "./approval.schema";
import { recoveryPlanItems } from "./recovery-plan-item.schema";

export const actionExecutions = pgTable(
  "action_executions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    approvalId: uuid("approval_id").references(() => approvals.id, { onDelete: "set null" }),
    planItemId: uuid("plan_item_id")
      .notNull()
      .references(() => recoveryPlanItems.id, { onDelete: "cascade" }),
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'running' | 'succeeded' | 'failed' | 'retrying'
    executedBy: varchar("executed_by", { length: 50 }).notNull().default("system"), // 'system' | 'agent' | 'manual'
    attempts: integer("attempts").notNull().default(0),
    executionPayload: jsonb("execution_payload").$type<Record<string, unknown>>().default({}),
    result: jsonb("result").$type<Record<string, unknown>>().default({}),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("action_executions_idempotency_key_unique").on(table.idempotencyKey),
    index("action_executions_plan_item_idx").on(table.planItemId),
    index("action_executions_approval_idx").on(table.approvalId),
    index("action_executions_status_idx").on(table.status),
  ],
);

export const actionExecutionsRelations = relations(actionExecutions, ({ one }) => ({
  planItem: one(recoveryPlanItems, {
    fields: [actionExecutions.planItemId],
    references: [recoveryPlanItems.id],
  }),
  approval: one(approvals, {
    fields: [actionExecutions.approvalId],
    references: [approvals.id],
  }),
}));

export type ActionExecution = typeof actionExecutions.$inferSelect;
export type NewActionExecution = typeof actionExecutions.$inferInsert;
