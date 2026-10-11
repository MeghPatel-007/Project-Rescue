import { pgTable, uuid, text, varchar, timestamp, bigint, integer, boolean, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { projects } from "./project.schema";
import { issueDependencies } from "./issue-dependency.schema";
import { recoveryPlanItems } from "./recovery-plan-item.schema";

export const githubIssues = pgTable(
  "github_issues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    githubIssueId: bigint("github_issue_id", { mode: "number" }).notNull(),
    issueNumber: integer("issue_number").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    state: varchar("state", { length: 50 }).notNull().default("open"), // 'open' | 'closed'
    stateReason: varchar("state_reason", { length: 100 }), // 'completed' | 'not_planned' | 'reopened' | null
    authorLogin: varchar("author_login", { length: 255 }),
    assignees: jsonb("assignees").$type<string[]>().default([]),
    labels: jsonb("labels").$type<string[]>().default([]),
    isBlocked: boolean("is_blocked").notNull().default(false),
    blockerCount: integer("blocker_count").notNull().default(0),
    criticality: varchar("criticality", { length: 50 }).default("medium"), // 'low' | 'medium' | 'high' | 'critical'
    githubCreatedAt: timestamp("github_created_at", { withTimezone: true }),
    githubUpdatedAt: timestamp("github_updated_at", { withTimezone: true }),
    githubClosedAt: timestamp("github_closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("github_issues_github_issue_id_unique").on(table.githubIssueId),
    uniqueIndex("github_issues_project_number_unique").on(table.projectId, table.issueNumber),
    index("github_issues_project_state_idx").on(table.projectId, table.state),
    index("github_issues_project_is_blocked_idx").on(table.projectId, table.isBlocked),
  ],
);

export const githubIssuesRelations = relations(githubIssues, ({ one, many }) => ({
  project: one(projects, {
    fields: [githubIssues.projectId],
    references: [projects.id],
  }),
  blockingEdges: many(issueDependencies, { relationName: "blockingIssue" }),
  blockedByEdges: many(issueDependencies, { relationName: "blockedIssue" }),
  recoveryPlanItems: many(recoveryPlanItems),
}));

export type GithubIssue = typeof githubIssues.$inferSelect;
export type NewGithubIssue = typeof githubIssues.$inferInsert;
