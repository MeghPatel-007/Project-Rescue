import { pgTable, uuid, text, varchar, timestamp, integer, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { projects } from "./project.schema";
import { user } from "./auth-schema";
import { recoveryPlanItems } from "./recovery-plan-item.schema";
import { agentRuns } from "./agent-run.schema";

export const recoveryPlans = pgTable(
  "recovery_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    version: integer("version").notNull().default(1),
    status: varchar("status", { length: 50 }).notNull().default("draft"), // 'draft' | 'proposed' | 'in_progress' | 'completed' | 'rejected' | 'superseded'
    riskLevel: varchar("risk_level", { length: 50 }).default("medium"), // 'low' | 'medium' | 'high' | 'critical'
    assumptions: jsonb("assumptions").$type<string[] | Record<string, unknown>>().default([]),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("recovery_plans_project_version_unique").on(table.projectId, table.version),
    index("recovery_plans_project_status_idx").on(table.projectId, table.status),
    index("recovery_plans_created_by_idx").on(table.createdById),
  ],
);

export const recoveryPlansRelations = relations(recoveryPlans, ({ one, many }) => ({
  project: one(projects, {
    fields: [recoveryPlans.projectId],
    references: [projects.id],
  }),
  createdBy: one(user, {
    fields: [recoveryPlans.createdById],
    references: [user.id],
  }),
  items: many(recoveryPlanItems),
  agentRuns: many(agentRuns),
}));

export type RecoveryPlan = typeof recoveryPlans.$inferSelect;
export type NewRecoveryPlan = typeof recoveryPlans.$inferInsert;
