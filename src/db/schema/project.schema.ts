import { pgTable, uuid, varchar, timestamp, bigint, integer, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { workspaces } from "./workspace.schema";
import { githubInstallations } from "./github-installation.schema";
import { githubIssues } from "./github-issue.schema";
import { githubPullRequests } from "./github-pull-request.schema";
import { issueDependencies } from "./issue-dependency.schema";
import { syncRuns } from "./sync-run.schema";
import { recoveryPlans } from "./recovery-plan.schema";
import { agentRuns } from "./agent-run.schema";
import { auditEvents } from "./audit-event.schema";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    githubInstallationId: uuid("github_installation_id").references(
      () => githubInstallations.id,
      { onDelete: "set null" },
    ),
    name: varchar("name", { length: 255 }).notNull(),
    repoOwner: varchar("repo_owner", { length: 255 }).notNull(),
    repoName: varchar("repo_name", { length: 255 }).notNull(),
    githubRepoId: bigint("github_repo_id", { mode: "number" }).notNull(),
    defaultBranch: varchar("default_branch", { length: 100 }).notNull().default("main"),
    status: varchar("status", { length: 50 }).notNull().default("active"), // 'active' | 'archived' | 'paused'
    healthScore: integer("health_score").default(100),
    version: integer("version").notNull().default(1), // Optimistic concurrency control
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("projects_workspace_repo_unique").on(table.workspaceId, table.repoOwner, table.repoName),
    index("projects_workspace_id_idx").on(table.workspaceId),
    index("projects_github_installation_id_idx").on(table.githubInstallationId),
    index("projects_github_repo_id_idx").on(table.githubRepoId),
  ],
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  githubInstallation: one(githubInstallations, {
    fields: [projects.githubInstallationId],
    references: [githubInstallations.id],
  }),
  issues: many(githubIssues),
  pullRequests: many(githubPullRequests),
  dependencies: many(issueDependencies),
  syncRuns: many(syncRuns),
  recoveryPlans: many(recoveryPlans),
  agentRuns: many(agentRuns),
  auditEvents: many(auditEvents),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
