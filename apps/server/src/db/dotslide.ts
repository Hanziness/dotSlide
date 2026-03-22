import { relations } from "drizzle-orm";
import {
  blob,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const presentation = sqliteTable("presentation", {
  id: text("id").primaryKey(),
  state: text("state", { mode: "json" }),
  owner: text("owner").references(() => user.id),
});

export const presentationRelations = relations(presentation, ({ one }) => ({
  owner: one(user)
}))

export const thumbnails = sqliteTable("thumbnails", {
  id: text("id").primaryKey(),
  presentation: text("presentation").references(() => presentation.id),
  type: text("type").notNull(),
  data: blob("data").notNull()
})

export const thumbnailsRelations = relations(thumbnails, ({ one }) => ({
  presentation: one(presentation)
}))

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
