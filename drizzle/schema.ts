import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "author", "editor", "admin", "super_admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const sections = mysqlTable("sections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const sources = mysqlTable("sources", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  publisher: varchar("publisher", { length: 255 }),
  url: varchar("url", { length: 2048 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["official", "primary", "editorial", "reference"]).default("reference").notNull(),
  notes: text("notes"),
  accessedAt: timestamp("accessedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentItems = mysqlTable("contentItems", {
  id: int("id").autoincrement().primaryKey(),
  sectionId: int("sectionId"),
  type: mysqlEnum("type", ["guide", "article", "landing", "faq"]).notNull(),
  status: mysqlEnum("status", ["draft", "in_review", "approved", "published", "archived"]).default("draft").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 190 }).notNull().unique(),
  excerpt: text("excerpt"),
  body: text("body"),
  h1: varchar("h1", { length: 255 }),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: varchar("seoDescription", { length: 320 }),
  canonicalPath: varchar("canonicalPath", { length: 255 }),
  indexable: boolean("indexable").default(false).notNull(),
  authorId: int("authorId"),
  reviewerId: int("reviewerId"),
  publishedAt: timestamp("publishedAt"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentSources = mysqlTable("contentSources", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  sourceId: int("sourceId").notNull(),
  citationNote: varchar("citationNote", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contentRevisions = mysqlTable("contentRevisions", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  version: int("version").notNull(),
  status: mysqlEnum("status", ["draft", "in_review", "approved", "published", "archived"]).notNull(),
  changeSummary: varchar("changeSummary", { length: 500 }).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const calendarEvents = mysqlTable("calendarEvents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 190 }).notNull().unique(),
  eventType: mysqlEnum("eventType", ["official", "guidance", "calculated", "observance"]).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt"),
  countryCode: varchar("countryCode", { length: 8 }),
  sourceId: int("sourceId"),
  lastReviewedAt: timestamp("lastReviewedAt"),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const toolDefinitions = mysqlTable("toolDefinitions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 190 }).notNull().unique(),
  category: varchar("category", { length: 120 }).notNull(),
  description: text("description").notNull(),
  logicVersion: varchar("logicVersion", { length: 40 }).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  relatedContentId: int("relatedContentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const relatedLinks = mysqlTable("relatedLinks", {
  id: int("id").autoincrement().primaryKey(),
  originType: mysqlEnum("originType", ["content", "tool", "event"]).notNull(),
  originId: int("originId").notNull(),
  targetType: mysqlEnum("targetType", ["content", "tool", "event"]).notNull(),
  targetId: int("targetId").notNull(),
  relationship: mysqlEnum("relationship", ["next_step", "explanation", "related", "source_context"]).notNull(),
  rationale: varchar("rationale", { length: 500 }),
  status: mysqlEnum("status", ["suggested", "approved", "disabled"]).default("suggested").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  channel: mysqlEnum("channel", ["in_app", "email", "browser"]).notNull(),
  topic: mysqlEnum("topic", ["important_guide", "calendar_event"]).notNull(),
  consented: boolean("consented").default(false).notNull(),
  consentedAt: timestamp("consentedAt"),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
