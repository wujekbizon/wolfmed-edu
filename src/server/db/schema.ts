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

export const completedTestes = createTable(
  "completed_tests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("userId", { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    sessionId: uuid("sessionId") 
      .references(() => testSessions.id, { onDelete: "cascade" }),
    testResult: jsonb("testResult").default([]),
    score: integer("score").notNull(),
    completedAt: timestamp("completedAt").notNull().defaultNow(),
  },
  (table) => [
    index("completed_tests_user_id_idx").on(table.userId),
  ]
)

export const testSessions = createTable(
  "test_sessions",
  {
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
  },
  (table) => [
    // Composite index: Covers both "WHERE userId = ?" and "WHERE userId = ? AND status = ?"
    index("test_sessions_user_status_idx").on(table.userId, table.status),
  ]
);

export const tests = createTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: varchar("category", { length: 256 }).notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt"),
})

export const userCustomTests = createTable(
  "user_custom_tests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("userId", { length: 256 }).notNull(),
    category: varchar("category", { length: 256 }).notNull(),
    data: jsonb("data").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt"),
  },
  (userCustomTests) => ({
    userIdIdx: index("user_custom_tests_userId_idx").on(userCustomTests.userId),
    categoryIdx: index("user_custom_tests_category_idx").on(userCustomTests.category),
  })
)

export const userCustomCategories = createTable(
  "user_custom_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("userId", { length: 256 }).notNull(),
    categoryName: varchar("categoryName", { length: 255 }).notNull(),
    questionIds: jsonb("questionIds").$type<string[]>().notNull().default([]),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (userCustomCategories) => ({
    userIdIdx: index("user_custom_categories_userId_idx").on(userCustomCategories.userId),
  })
)

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
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
})

// Blog status enum
export const blogStatusEnum = pgEnum('blog_status', [
  'draft',
  'published',
  'archived',
])

// Blog categories table
export const blogCategories = createTable(
  'blog_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    color: varchar('color', { length: 7 }).default('#ef4444'), // Red medical theme
    icon: varchar('icon', { length: 50 }),
    order: integer('order').default(0),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    index('blog_categories_slug_idx').on(table.slug),
  ]
)

// Blog tags table
export const blogTags = createTable(
  'blog_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    index('blog_tags_slug_idx').on(table.slug),
  ]
)

// Enhanced blog posts table
export const blogPosts = createTable(
  'blog_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Content fields
    title: varchar('title', { length: 256 }).notNull(),
    slug: varchar('slug', { length: 256 }).notNull().unique(),
    excerpt: text('excerpt').notNull(),
    content: text('content').notNull(), // MDX/Markdown content
    coverImage: varchar('coverImage', { length: 512 }),

    // Organization
    categoryId: uuid('categoryId').references(() => blogCategories.id, {
      onDelete: 'set null',
    }),

    // Metadata
    authorId: varchar('authorId', { length: 256 }).notNull(),
    authorName: varchar('authorName', { length: 256 }).notNull(),

    // Publishing
    status: blogStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('publishedAt'),

    // SEO
    metaTitle: varchar('metaTitle', { length: 256 }),
    metaDescription: text('metaDescription'),
    metaKeywords: text('metaKeywords'),

    // Analytics
    viewCount: integer('viewCount').default(0).notNull(),
    readingTime: integer('readingTime'), // in minutes

    // Legacy date field (for backward compatibility)
    date: varchar('date', { length: 64 }),

    // Timestamps
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('blog_posts_slug_idx').on(table.slug),
    index('blog_posts_category_idx').on(table.categoryId),
    index('blog_posts_author_idx').on(table.authorId),
    index('blog_posts_status_idx').on(table.status),
    index('blog_posts_published_at_idx').on(table.publishedAt),
  ]
)

// Blog post tags (many-to-many relationship)
export const blogPostTags = createTable(
  'blog_post_tags',
  {
    postId: uuid('postId')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    tagId: uuid('tagId')
      .notNull()
      .references(() => blogTags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('blog_post_tags_pk').on(table.postId, table.tagId),
    index('blog_post_tags_post_idx').on(table.postId),
    index('blog_post_tags_tag_idx').on(table.tagId),
  ]
)

// Blog likes table
export const blogLikes = createTable(
  'blog_likes',
  {
    userId: varchar('userId', { length: 256 }).notNull(),
    postId: uuid('postId')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    index('blog_likes_pk').on(table.userId, table.postId),
    index('blog_likes_post_idx').on(table.postId),
  ]
)

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

// Blog relations
export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
  tags: many(blogPostTags),
  likes: many(blogLikes),
}))

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts),
}))

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(blogPostTags),
}))

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id],
  }),
  tag: one(blogTags, {
    fields: [blogPostTags.tagId],
    references: [blogTags.id],
  }),
}))

export const blogLikesRelations = relations(blogLikes, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogLikes.postId],
    references: [blogPosts.id],
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

export const materials = createTable(
  "materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("userId", { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    title: varchar("title", { length: 256 }).notNull(),
    key: varchar("key", { length: 256 }).notNull().unique(),
    url: text("url").notNull(),
    type: varchar("type", { length: 64 }).notNull(),
    category: varchar("category", { length: 128 }).notNull(),
    size: integer("size").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [
    index("materials_user_id_idx").on(table.userId),
    index("materials_category_idx").on(table.category),
    index("materials_type_idx").on(table.type),
  ]
);

export const materialsRelations = relations(materials, ({ one }) => ({
  user: one(users, {
    fields: [materials.userId],
    references: [users.userId],
  }),
}));

export const userLimits = createTable(
  "user_limits", 
  {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("userId", { length: 256 })
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" })
    .unique(),
  storageLimit: integer("storage_limit").notNull().default(20_000_000),
  storageUsed: integer("storage_used").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
},
(table) => [
  index("user_limits_user_id_idx").on(table.userId),
]
);

export const userLimitsRelations = relations(userLimits, ({ one }) => ({
  user: one(users, {
    fields: [userLimits.userId],
    references: [users.userId],
  }),
}));

export const challengeCompletions = createTable(
  "challenge_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("userId", { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    procedureId: varchar("procedureId", { length: 256 }).notNull(),
    challengeType: varchar("challengeType", { length: 64 }).notNull(),
    score: integer("score").notNull(),
    timeSpent: integer("timeSpent").notNull(),
    attempts: integer("attempts").notNull().default(1),
    passed: boolean("passed").notNull().default(false),
    completedAt: timestamp("completedAt").defaultNow().notNull(),
  },
  (table) => [
    index("challenge_completions_user_id_idx").on(table.userId),
    index("challenge_completions_procedure_id_idx").on(table.procedureId),
    index("challenge_completions_user_procedure_idx").on(table.userId, table.procedureId),
  ]
);

export const challengeCompletionsRelations = relations(challengeCompletions, ({ one }) => ({
  user: one(users, {
    fields: [challengeCompletions.userId],
    references: [users.userId],
  }),
}));

export const procedureBadges = createTable(
  "procedure_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("userId", { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    procedureId: varchar("procedureId", { length: 256 }).notNull(),
    procedureName: varchar("procedureName", { length: 256 }).notNull(),
    badgeImageUrl: text("badgeImageUrl").notNull().default("/images/badge-placeholder.png"),
    earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  },
  (table) => [
    index("procedure_badges_user_id_idx").on(table.userId),
    index("procedure_badges_procedure_id_idx").on(table.procedureId),
    index("procedure_badges_earned_at_idx").on(table.earnedAt),
  ]
);

export const procedureBadgesRelations = relations(procedureBadges, ({ one }) => ({
  user: one(users, {
    fields: [procedureBadges.userId],
    references: [users.userId],
  }),
}));

// Type exports
export type UserCustomTest = typeof userCustomTests.$inferSelect
export type NewUserCustomTest = typeof userCustomTests.$inferInsert
export type UserCustomCategory = typeof userCustomCategories.$inferSelect
export type NewUserCustomCategory = typeof userCustomCategories.$inferInsert
