import { relations } from "drizzle-orm";
import {
  blob,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const presentation = sqliteTable("presentation", {
  id: text("id").primaryKey(),
  state: text("state", { mode: "json" })
});

export const members = sqliteTable("members", {
  presentation: text("id").references(() => presentation.id, { onDelete: "cascade" }).notNull(),
  user: text("user").references(() => user.id, { onDelete: "cascade" }).notNull(),
  role: text("role", { enum: ["presenter", "controller"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
}, (t) => [
  primaryKey({ columns: [t.presentation, t.user] }),
  index("membersIdx").on(t.user, t.presentation)
])

export const membersRelations = relations(members, ({ one }) => ({
  presentation: one(presentation),
  user: one(user)
}))

export const invites = sqliteTable("invites", {
  id: text("id").primaryKey(),
  presentation: text("presentation").references(() => presentation.id, { onDelete: "cascade" }).notNull(),
  issuedBy: text("issued_by").references(() => user.id, { onDelete: "cascade" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date(Date.now() + 300 * 1000)),
  redeemedAt: integer("redeemed_at", { mode: "timestamp_ms" })
}, (t) => [
  index("invites_presentation_idx").on(t.presentation)
])

export const invitesRelations = relations(invites, ({ one }) => ({
  presentation: one(presentation),
  issuedBy: one(user)
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
