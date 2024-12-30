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

export const blogPosts = createTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 256 }).notNull(),
  date: varchar('date', { length: 64 }).notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt'),
})

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
