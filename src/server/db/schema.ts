import { sql } from 'drizzle-orm'
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
    testLimit: integer('testLimit').default(1000),
    createdAt: timestamp('createdAt').default(sql`CURRENT_TIMESTAMP`),
    motto: varchar('motto').default('').notNull(),
    supporter: boolean('supporter').default(false).notNull(),
    username: varchar('username', { length: 256 }).default('').notNull(),
    updatedAt: timestamp('updatedAt'),
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
  createdAt: timestamp('createdAt')
    .default(sql`NOW()`)
    .notNull(),
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
  createdAt: timestamp('createdAt')
    .default(sql`NOW()`)
    .notNull(),
})

export const processedEvents = createTable('processed_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: varchar('eventId', { length: 256 }).notNull().unique(),
  userId: varchar('userId', { length: 256 }).notNull(),
  processedAt: timestamp('processedAt').default(sql`CURRENT_TIMESTAMP`),
})

export const completedTestes = createTable('completed_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('userId', { length: 256 })
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  testResult: jsonb('testResult').default([]),
  score: integer('score').notNull(),
  completedAt: timestamp('completedAt')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const tests = createTable('tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 256 }).notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('createdAt')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt'),
})

export const procedures = createTable('procedures', {
  id: uuid('id').primaryKey().defaultRandom(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('createdAt')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
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
  createdAt: timestamp('createdAt')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt'),
})
