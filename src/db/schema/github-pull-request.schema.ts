import { pgTable, uuid, text, varchar, timestamp, bigint, integer, boolean, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { projects } from "./project.schema";

export const githubPullRequests = pgTable(
  "github_pull_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    githubPrId: bigint("github_pr_id", { mode: "number" }).notNull(),
    prNumber: integer("pr_number").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    state: varchar("state", { length: 50 }).notNull().default("open"), // 'open' | 'closed' | 'merged'
    isDraft: boolean("is_draft").notNull().default(false),
    headRef: varchar("head_ref", { length: 255 }),
    baseRef: varchar("base_ref", { length: 255 }),
    authorLogin: varchar("author_login", { length: 255 }),
    assignees: jsonb("assignees").$type<string[]>().default([]),
    labels: jsonb("labels").$type<string[]>().default([]),
    mergedAt: timestamp("merged_at", { withTimezone: true }),
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
    uniqueIndex("github_prs_github_pr_id_unique").on(table.githubPrId),
    uniqueIndex("github_prs_project_number_unique").on(table.projectId, table.prNumber),
    index("github_prs_project_state_idx").on(table.projectId, table.state),
  ],
);

export const githubPullRequestsRelations = relations(githubPullRequests, ({ one }) => ({
  project: one(projects, {
    fields: [githubPullRequests.projectId],
    references: [projects.id],
  }),
}));

export type GithubPullRequest = typeof githubPullRequests.$inferSelect;
export type NewGithubPullRequest = typeof githubPullRequests.$inferInsert;
