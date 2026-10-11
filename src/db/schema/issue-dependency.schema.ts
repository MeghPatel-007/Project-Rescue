import { pgTable, uuid, varchar, timestamp, integer, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { projects } from "./project.schema";
import { githubIssues } from "./github-issue.schema";

export const issueDependencies = pgTable(
  "issue_dependencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    blockingIssueId: uuid("blocking_issue_id")
      .notNull()
      .references(() => githubIssues.id, { onDelete: "cascade" }),
    blockedIssueId: uuid("blocked_issue_id")
      .notNull()
      .references(() => githubIssues.id, { onDelete: "cascade" }),
    dependencyType: varchar("dependency_type", { length: 50 }).notNull().default("blocks"), // 'blocks' | 'relates_to' | 'parent_child'
    discoveredBy: varchar("discovered_by", { length: 50 }).notNull().default("ai_agent"), // 'ai_agent' | 'manual' | 'github_link'
    confidence: integer("confidence").default(100), // 0 to 100 percentage
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("issue_dependencies_blocking_blocked_unique").on(table.blockingIssueId, table.blockedIssueId),
    index("issue_dependencies_project_id_idx").on(table.projectId),
    index("issue_dependencies_blocking_idx").on(table.blockingIssueId),
    index("issue_dependencies_blocked_idx").on(table.blockedIssueId),
  ],
);

export const issueDependenciesRelations = relations(issueDependencies, ({ one }) => ({
  project: one(projects, {
    fields: [issueDependencies.projectId],
    references: [projects.id],
  }),
  blockingIssue: one(githubIssues, {
    fields: [issueDependencies.blockingIssueId],
    references: [githubIssues.id],
    relationName: "blockingIssue",
  }),
  blockedIssue: one(githubIssues, {
    fields: [issueDependencies.blockedIssueId],
    references: [githubIssues.id],
    relationName: "blockedIssue",
  }),
}));

export type IssueDependency = typeof issueDependencies.$inferSelect;
export type NewIssueDependency = typeof issueDependencies.$inferInsert;
