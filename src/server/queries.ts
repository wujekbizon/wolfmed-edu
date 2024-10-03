import 'server-only'
import { db } from '@/server/db/index'
import { blogPosts, payments, subscriptions, users } from './db/schema'
import { ExtendedCompletedTest, ExtendedProcedures, ExtendedTest, Post } from '@/types/dataTypes'
import { cache } from 'react'
import { eq } from 'drizzle-orm'

export const getAllTests = cache(async (): Promise<ExtendedTest[]> => {
  const tests = await db.query.tests.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })

  return tests
})

export const getAllProcedures = cache(async (): Promise<ExtendedProcedures[]> => {
  const procedures = await db.query.procedures.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })

  return procedures
})

export const getAllPosts = cache(async (): Promise<Post[]> => {
  const posts = await db.query.blogPosts.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })

  return posts
})

export const getCompletedTestsByUser = cache(async (userId: string): Promise<ExtendedCompletedTest[]> => {
  const completedTest = await db.query.completedTestes.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.completedAt),
  })

  return completedTest
})

export const getCompletedTest = cache(async (testId: string) => {
  const completedTest = await db.query.completedTestes.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })

  return completedTest
})

export const getQuestionById = cache(async (testId: string) => {
  const question = await db.query.tests.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })

  return question
})

export const getUserTestLimit = cache(async (id: string) => {
  const [testLimit] = await db.select({ testLimit: users.testLimit }).from(users).where(eq(users.userId, id))
  return testLimit
})

export async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  try {
    const subscription = await db.select().from(subscriptions).where(eq(subscriptions.customerId, customerId)).limit(1)

    if (subscription) {
      return subscription[0]?.userId || null
    } else {
      throw new Error('Subscription not found')
    }
  } catch (error) {
    console.error('Error fetching subscription:', error)
    throw error
  }
}

export async function getUserIdByCustomerEmail(customerEmail: string): Promise<string | null> {
  try {
    const payment = await db.select().from(payments).where(eq(payments.customerEmail, customerEmail)).limit(1)
    if (payment) {
      return payment[0]?.userId || null
    } else {
      throw new Error('Payment not found')
    }
  } catch (error) {
    console.error('Error fetching payment:', error)
    throw error
  }
}

// Function to fetch a single post by ID from the database
export async function getPostById(id: string) {
  const post = await db.query.blogPosts.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  })
  return post
}
