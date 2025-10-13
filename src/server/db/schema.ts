import {
  pgTableCreator,
  timestamp,
  varchar,
  jsonb,
  integer,
  uuid,
  index,
  serial,
  text,
  pgEnum,
  boolean,
  real
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const createTable = pgTableCreator((name) => `wolfmed_${name}`)

export const currencyEnum = pgEnum("currency", ["pln", "usd", "eur"])

export const users = createTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("userId", { length: 256 }).notNull().unique(),
    testLimit: integer("testLimit").default(150),
    createdAt: timestamp("createdAt").defaultNow(),
    motto: varchar("motto").default("").notNull(),
    supporter: boolean("supporter").default(false).notNull(),
    username: varchar("username", { length: 256 }).default("").notNull(),
    updatedAt: timestamp("updatedAt"),
    testsAttempted: integer("tests_attempted").default(0).notNull(),
    totalScore: integer("total_score").default(0).notNull(),
    totalQuestions: integer("total_questions").default(0).notNull(),
  },
  (table) => [
    index("usersUserId").on(table.userId),
    index("usersUsername").on(table.username),
  ]
)

export const payments = createTable("stripe_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("userId", { length: 256 }).notNull(),
  amountTotal: integer("amountTotal").notNull(),
  currency: currencyEnum("currency"),
  customerEmail: varchar("customerEmail", { length: 256 }).notNull(),
  paymentStatus: varchar("paymentStatus", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
})

export const subscriptions = createTable("stripe_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("userId", { length: 256 }).notNull().unique(),
  sessionId: varchar("sessionId", { length: 256 }).notNull(),
  amountTotal: integer("amountTotal").notNull(),
  currency: currencyEnum("currency"),
  customerId: varchar("customerId", { length: 256 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 256 }).notNull(),
  invoiceId: varchar("invoiceId", { length: 256 }).notNull(),
  paymentStatus: varchar("paymentStatus", { length: 50 }).notNull(),
  subscriptionId: varchar("subscriptionId", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
})

export const processedEvents = createTable("processed_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: varchar("eventId", { length: 256 }).notNull().unique(),
  userId: varchar("userId", { length: 256 }).notNull(),
  processedAt: timestamp("processedAt").defaultNow(),
})

export const completedTestes = createTable("completed_tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("userId", { length: 256 })
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  sessionId: uuid("sessionId")
  .notNull()
  .references(() => testSessions.id, { onDelete: "cascade" }),
  testResult: jsonb("testResult").default([]),
  score: integer("score").notNull(),
  completedAt: timestamp("completedAt").notNull().defaultNow(),
})

export const testSessions = createTable("test_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("userId", { length: 256 })
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  category: varchar("category", { length: 128 }).notNull(),
  numberOfQuestions: integer("numberOfQuestions").notNull(),
  durationMinutes: integer("durationMinutes").notNull(),
  startedAt: timestamp("startedAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt").notNull(),
  finishedAt: timestamp("finishedAt"),
  status: varchar("status", { length: 32 })
    .$type<"ACTIVE" | "EXPIRED" | "COMPLETED" | "CANCELLED">()
    .notNull()
    .default("ACTIVE"),
  meta: jsonb("meta").default({}),
});

export const tests = createTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: varchar("category", { length: 256 }).notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt"),
})

export const procedures = createTable("procedures", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt"),
})

export const customersMessages = createTable("messages", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
})

export const blogPosts = createTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  date: varchar("date", { length: 64 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt"),
})

export const forumPosts = createTable(
  "forum_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 256 }).notNull(),
    content: text("content").notNull(),
    authorId: varchar("authorId", { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    authorName: varchar("authorName", { length: 256 }).notNull(),
    readonly: boolean("readonly").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [
    index("forum_posts_author_id_idx").on(table.authorId),
    index("forum_posts_created_at_idx").on(table.createdAt),
  ]
)

export const forumComments = createTable(
  "forum_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    postId: uuid("postId")
      .notNull()
      .references(() => forumPosts.id, { onDelete: "cascade" }),
    authorId: varchar("authorId", { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    authorName: varchar("authorName", { length: 256 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("forum_comments_post_id_idx").on(table.postId),
    index("forum_comments_author_id_idx").on(table.authorId),
    index("forum_comments_created_at_idx").on(table.createdAt),
  ]
)

export const forumPostsRelations = relations(forumPosts, ({ many }) => ({
  comments: many(forumComments),
}))

export const forumCommentsRelations = relations(forumComments, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumComments.postId],
    references: [forumPosts.id],
  }),
}))

export const testimonials = createTable(
  'testimonials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('userId', {length:256})
      .notNull()
      .references(() => users.userId, {onDelete: 'cascade'}),
    content: text('content').notNull(),
    rating: real('rating').default(5).notNull(),
    visible:boolean('visible').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('testimonials_user_id_idx').on(table.userId),
    index('testimonials_created_at_idx').on(table.createdAt),
  ]
)

export const testimonialsRelations = relations(testimonials, ({one}) => ({
  author: one(users, {
    fields:[testimonials.userId],
    references: [users.userId],
    relationName: 'testimonialsAuthor'
  })
}))

export const usersRelations = relations(users, ({many}) => (
  {
    testimonials: many(testimonials, { relationName: 'testimonialsAuthor'})
  }
))

export const notes = createTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("userId", { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    title: varchar("title", { length: 256 }).notNull(),
    content: jsonb("content").notNull(),
    plainText: text("plain_text"),
    excerpt: text("excerpt").default(""),
    category: varchar("category", { length: 128 }).notNull(),
    tags: jsonb("tags").default([]),
    pinned: boolean("pinned").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [
    index("notes_user_id_idx").on(table.userId),
    index("notes_category_idx").on(table.category),
    index("notes_pinned_idx").on(table.pinned),
    index("notes_created_at_idx").on(table.createdAt),
  ]
)

export const userCellsList = createTable(
  "user_cells_list",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("userId", { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    cells: jsonb("cells").notNull(),
    order: jsonb("order").notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("user_cells_list_user_id_idx").on(table.userId),
  ]
)