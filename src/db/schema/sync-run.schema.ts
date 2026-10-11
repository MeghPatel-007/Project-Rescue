import { pgTable, uuid, text, varchar, timestamp, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { projects } from "./project.schema";

export const syncRuns = pgTable(
  "sync_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    trigger: varchar("trigger", { length: 50 }).notNull().default("scheduled"), // 'manual' | 'webhook' | 'scheduled' | 'agent'
    status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'running' | 'completed' | 'failed'
    issuesSynced: integer("issues_synced").default(0),
    prsSynced: integer("prs_synced").default(0),
    dependenciesDetected: integer("dependencies_detected").default(0),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    snapshotReference: text("snapshot_reference"), // Cross-db reference to MongoDB GitHubSnapshot._id
  },
  (table) => [
    index("sync_runs_project_started_idx").on(table.projectId, table.startedAt),
    index("sync_runs_status_idx").on(table.status),
  ],
);

export const syncRunsRelations = relations(syncRuns, ({ one }) => ({
  project: one(projects, {
    fields: [syncRuns.projectId],
    references: [projects.id],
  }),
}));

export type SyncRun = typeof syncRuns.$inferSelect;
export type NewSyncRun = typeof syncRuns.$inferInsert;
