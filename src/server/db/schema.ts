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
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const createTable = pgTableCreator((name) => `wolfmed_${name}`)

export const currencyEnum = pgEnum('currency', ['pln', 'usd', 'eur'])

export const users = createTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('userId', { length: 256 }).notNull().unique(),
    testLimit: integer('testLimit').default(150),
    createdAt: timestamp('createdAt').defaultNow(),
    motto: varchar('motto').default('').notNull(),
    supporter: boolean('supporter').default(false).notNull(),
    username: varchar('username', { length: 256 }).default('').notNull(),
    updatedAt: timestamp('updatedAt'),
    testsAttempted: integer('tests_attempted').default(0).notNull(),
    totalScore: integer('total_score').default(0).notNull(),
    totalQuestions: integer('total_questions').default(0).notNull(),
  },
  (table) => ({
    userIdIndex: index('usersUserId').on(table.userId),
    usernameIndex: index('usersUsername').on(table.username),
  })
)

export const payments = createTable('stripe_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('userId', { length: 256 }).notNull(),
  amountTotal: integer('amountTotal').notNull(),
  currency: currencyEnum('currency'),
  customerEmail: varchar('customerEmail', { length: 256 }).notNull(),
  paymentStatus: varchar('paymentStatus', { length: 50 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
})

export const subscriptions = createTable('stripe_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('userId', { length: 256 }).notNull().unique(),
  sessionId: varchar('sessionId', { length: 256 }).notNull(),
  amountTotal: integer('amountTotal').notNull(),
  currency: currencyEnum('currency'),
  customerId: varchar('customerId', { length: 256 }).notNull(),
  customerEmail: varchar('customerEmail', { length: 256 }).notNull(),
  invoiceId: varchar('invoiceId', { length: 256 }).notNull(),
  paymentStatus: varchar('paymentStatus', { length: 50 }).notNull(),
  subscriptionId: varchar('subscriptionId', { length: 256 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const processedEvents = createTable('processed_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: varchar('eventId', { length: 256 }).notNull().unique(),
  userId: varchar('userId', { length: 256 }).notNull(),
  processedAt: timestamp('processedAt').defaultNow(),
})

export const completedTestes = createTable('completed_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('userId', { length: 256 })
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  testResult: jsonb('testResult').default([]),
  score: integer('score').notNull(),
  completedAt: timestamp('completedAt').notNull().defaultNow(),
})

export const tests = createTable('tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 256 }).notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt'),
})

export const procedures = createTable('procedures', {
  id: uuid('id').primaryKey().defaultRandom(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt'),
})

export const customersMessages = createTable('messages', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt'),
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
  (table) => ({
    slugIdx: index('blog_categories_slug_idx').on(table.slug),
  })
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
  (table) => ({
    slugIdx: index('blog_tags_slug_idx').on(table.slug),
  })
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
  (table) => ({
    slugIdx: index('blog_posts_slug_idx').on(table.slug),
    categoryIdx: index('blog_posts_category_idx').on(table.categoryId),
    authorIdx: index('blog_posts_author_idx').on(table.authorId),
    statusIdx: index('blog_posts_status_idx').on(table.status),
    publishedAtIdx: index('blog_posts_published_at_idx').on(table.publishedAt),
  })
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
  (table) => ({
    pk: index('blog_post_tags_pk').on(table.postId, table.tagId),
    postIdx: index('blog_post_tags_post_idx').on(table.postId),
    tagIdx: index('blog_post_tags_tag_idx').on(table.tagId),
  })
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
  (table) => ({
    pk: index('blog_likes_pk').on(table.userId, table.postId),
    postIdx: index('blog_likes_post_idx').on(table.postId),
  })
)

export const forumPosts = createTable(
  'forum_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 256 }).notNull(),
    content: text('content').notNull(),
    authorId: varchar('authorId', { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    authorName: varchar('authorName', { length: 256 }).notNull(),
    readonly: boolean('readonly').default(false).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => ({
    authorIdIdx: index('forum_posts_author_id_idx').on(table.authorId),
    createdAtIdx: index('forum_posts_created_at_idx').on(table.createdAt),
  })
)

export const forumComments = createTable(
  'forum_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content').notNull(),
    postId: uuid('postId')
      .notNull()
      .references(() => forumPosts.id, { onDelete: 'cascade' }),
    authorId: varchar('authorId', { length: 256 })
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    authorName: varchar('authorName', { length: 256 }).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    postIdIdx: index('forum_comments_post_id_idx').on(table.postId),
    authorIdIdx: index('forum_comments_author_id_idx').on(table.authorId),
    createdAtIdx: index('forum_comments_created_at_idx').on(table.createdAt),
  })
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
