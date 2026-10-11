import { pgTable, uuid, text, varchar, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { projects } from "./project.schema";
import { recoveryPlans } from "./recovery-plan.schema";

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").references(() => recoveryPlans.id, { onDelete: "set null" }),
    trigger: varchar("trigger", { length: 50 }).notNull().default("manual"), // 'scheduled' | 'manual' | 'sync_completed' | 'mcp_tool' | 'alexa'
    status: varchar("status", { length: 50 }).notNull().default("running"), // 'running' | 'completed' | 'failed' | 'cancelled'
    prompt: text("prompt"),
    model: varchar("model", { length: 100 }),
    tokensUsed: integer("tokens_used"),
    summary: text("summary"),
    errorMessage: text("error_message"),
    mongoArtifactIds: jsonb("mongo_artifact_ids").$type<string[]>().default([]), // Cross-db refs to MongoDB AgentArtifact._id
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("agent_runs_project_started_idx").on(table.projectId, table.startedAt),
    index("agent_runs_plan_idx").on(table.planId),
    index("agent_runs_status_idx").on(table.status),
  ],
);

export const agentRunsRelations = relations(agentRuns, ({ one }) => ({
  project: one(projects, {
    fields: [agentRuns.projectId],
    references: [projects.id],
  }),
  plan: one(recoveryPlans, {
    fields: [agentRuns.planId],
    references: [recoveryPlans.id],
  }),
}));

export type AgentRun = typeof agentRuns.$inferSelect;
export type NewAgentRun = typeof agentRuns.$inferInsert;
