import { pgTable, uuid, text, varchar, timestamp, bigint, index, uniqueIndex } from "drizzle-orm/pg-core";

export const githubDeliveryEvents = pgTable(
  "github_delivery_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deliveryId: varchar("delivery_id", { length: 255 }).notNull(), // GitHub X-GitHub-Delivery header
    eventType: varchar("event_type", { length: 100 }).notNull(), // e.g. 'issues', 'pull_request', 'push'
    installationId: bigint("installation_id", { mode: "number" }),
    repoName: varchar("repo_name", { length: 255 }),
    status: varchar("status", { length: 50 }).notNull().default("received"), // 'received' | 'processing' | 'completed' | 'failed' | 'ignored'
    errorMessage: text("error_message"),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("github_delivery_events_delivery_id_unique").on(table.deliveryId),
    index("github_delivery_events_event_type_status_idx").on(table.eventType, table.status),
  ],
);

export type GithubDeliveryEvent = typeof githubDeliveryEvents.$inferSelect;
export type NewGithubDeliveryEvent = typeof githubDeliveryEvents.$inferInsert;
