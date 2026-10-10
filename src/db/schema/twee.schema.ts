import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const tweetTable = pgTable("tweets", {
  tweetid: integer().primaryKey().generatedAlwaysAsIdentity(),
  tweetname: varchar({ length: 255 }).notNull(),
  
});
