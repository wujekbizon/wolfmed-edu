import { sql } from 'drizzle-orm'
import { pgTableCreator, timestamp, varchar, jsonb, integer, uuid, index, serial, text } from 'drizzle-orm/pg-core'

export const createTable = pgTableCreator((name) => `wolfmed_${name}`)

export const users = createTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('userId', { length: 256 }).notNull().unique(),
    testLimit: integer('testLimit').default(10),
    createdAt: timestamp('createdAt').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updatedAt'),
  },
  (table) => ({
    userIdIndex: index('usersUserId').on(table.userId),
  })
)

export const processedEvents = createTable('processed_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: varchar('eventId', { length: 256 }).notNull().unique(),
  userId: varchar('userId', { length: 256 }).notNull(),
  processedAt: timestamp('processedAt').default(sql`CURRENT_TIMESTAMP`),
})

export const completedTestes = createTable('comleted_tests', {
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
