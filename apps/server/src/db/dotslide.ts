import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const question = sqliteTable(
  "question",
  {
    id: text("id").primaryKey(),
    text: text("text").notNull(),
    authorId: text("authorId").references(() => user.id),
    authorName: text("authorName").notNull().default("Anonymous"),
    timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
    upvotes: integer("upvotes").notNull().default(0),
    dismissed: integer("dismissed", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (table) => [index("id_idx").on(table.id)],
);

export const questionRelations = relations(question, ({ one }) => ({
  authorId: one(user),
}));
