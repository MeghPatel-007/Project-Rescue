import { pgTable, uuid, text, varchar, timestamp, bigint, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";
import { workspaces } from "./workspace.schema";
import { user } from "./auth-schema";
import { projects } from "./project.schema";

export const githubInstallations = pgTable(
  "github_installations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    installationId: bigint("installation_id", { mode: "number" }).notNull(),
    accountLogin: varchar("account_login", { length: 255 }).notNull(),
    accountType: varchar("account_type", { length: 50 }).notNull(), // 'User' | 'Organization'
    repositorySelection: varchar("repository_selection", { length: 50 }).notNull().default("all"), // 'all' | 'selected'
    permissions: jsonb("permissions").$type<Record<string, string>>().default({}),
    installedByUserId: text("installed_by_user_id").references(() => user.id, { onDelete: "set null" }),
    encryptedToken: text("encrypted_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    status: varchar("status", { length: 50 }).notNull().default("active"), // 'active' | 'suspended' | 'deleted'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("github_installations_installation_id_unique").on(table.installationId),
    index("github_installations_workspace_id_idx").on(table.workspaceId),
    index("github_installations_account_login_idx").on(table.accountLogin),
  ],
);

export const githubInstallationsRelations = relations(githubInstallations, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [githubInstallations.workspaceId],
    references: [workspaces.id],
  }),
  installedByUser: one(user, {
    fields: [githubInstallations.installedByUserId],
    references: [user.id],
  }),
  projects: many(projects),
}));

export type GithubInstallation = typeof githubInstallations.$inferSelect;
export type NewGithubInstallation = typeof githubInstallations.$inferInsert;
