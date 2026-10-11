import { pgTable, uuid, text, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { workspaces } from "./workspace.schema";
import { projects } from "./project.schema";
import { user } from "./auth-schema";

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(), // e.g. 'project.connected', 'plan.created', 'plan_item.approved'
    entityType: varchar("entity_type", { length: 100 }).notNull(), // 'workspace', 'project', 'recovery_plan', 'approval', etc.
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().default({}),
    ipAddress: varchar("ip_address", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_events_workspace_created_idx").on(table.workspaceId, table.createdAt),
    index("audit_events_project_created_idx").on(table.projectId, table.createdAt),
    index("audit_events_user_created_idx").on(table.userId, table.createdAt),
    index("audit_events_action_idx").on(table.action),
  ],
);

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [auditEvents.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [auditEvents.projectId],
    references: [projects.id],
  }),
  user: one(user, {
    fields: [auditEvents.userId],
    references: [user.id],
  }),
}));

export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
