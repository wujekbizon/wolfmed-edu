import 'server-only'
import { db } from '@/server/db/index'
import { completedTestes, payments, subscriptions, users, forumPosts, forumComments } from './db/schema'
import { ExtendedCompletedTest, ExtendedProcedures, ExtendedTest, Post } from '@/types/dataTypes'
import { cache } from 'react'
import { eq, asc, desc } from 'drizzle-orm'
import { Post as ForumPost } from '@/types/forumPostsTypes'
import { Payment, Supporter } from '@/types/stripeTypes'

// Get all tests with their data, ordered by newest first
export const getAllTests = cache(async (): Promise<ExtendedTest[]> => {
  const tests = await db.query.tests.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })
  return tests
})

// Get all medical procedures, ordered by newest first
export const getAllProcedures = cache(async (): Promise<ExtendedProcedures[]> => {
  const procedures = await db.query.procedures.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })
  return procedures
})

// Get all blog posts, ordered by newest first
export const getAllPosts = cache(async (): Promise<Post[]> => {
  const posts = await db.query.blogPosts.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })
  return posts
})

// Get all completed tests for a specific user, ordered by completion date
export const getCompletedTestsByUser = cache(async (userId: string): Promise<ExtendedCompletedTest[]> => {
  const completedTest = await db.query.completedTestes.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.completedAt),
  })
  return completedTest
})

// Get a specific completed test by its ID
export const getCompletedTest = cache(async (testId: string) => {
  const completedTest = await db.query.completedTestes.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })
  return completedTest
})

// Get a specific question by its test ID
export const getQuestionById = cache(async (testId: string) => {
  const question = await db.query.tests.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })
  return question
})

// Get user's remaining test limit
export const getUserTestLimit = cache(async (id: string) => {
  const [testLimit] = await db.select({ testLimit: users.testLimit }).from(users).where(eq(users.userId, id))
  return testLimit
})

// Get userId by Stripe customer ID
export const getUserIdByCustomer = cache(async (customerId: string): Promise<string | null> => {
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
})

// Get userId by customer email
export const getUserIdByCustomerEmail = cache(async (customerEmail: string): Promise<string | null> => {
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
})

// Get a blog post by its ID
export const getPostById = cache(async (id: string) => {
  const post = await db.query.blogPosts.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  })
  return post
})

// Delete a completed test by its ID
export const deleteCompletedTest = cache(async (testId: string) => {
  await db.delete(completedTestes).where(eq(completedTestes.id, testId))
})

// Update username for a specific user
export const updateUsernameByUserId = cache(async (userId: string, newUsername: string) => {
  await db.update(users).set({ username: newUsername }).where(eq(users.userId, userId))
})

// Get username for a specific user
export const getUserUsername = cache(async (userId: string): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
    columns: { username: true },
  })
  return user?.username || ''
})

// Update motto for a specific user
export const updateMottoByUserId = cache(async (userId: string, newMotto: string) => {
  await db.update(users).set({ motto: newMotto }).where(eq(users.userId, userId))
})

// Get motto for a specific user
export const getUserMotto = cache(async (userId: string): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
    columns: { motto: true },
  })
  return user?.motto || ''
})

// Get early supporters list, limited to specified number
export const getEarlySupporters = cache(async (limit: number = 5): Promise<{ id: string; username: string }[]> => {
  const supporters = await db
    .select({
      userId: users.userId,
      username: users.username,
    })
    .from(users)
    .where(eq(users.supporter, true))
    .orderBy(asc(users.createdAt))
    .limit(limit)

  return supporters.map((supporter) => ({
    id: supporter.userId,
    username: supporter.username || 'Anonymous',
  }))
})

// Check if a user is a supporter
export const getSupporterByUserId = cache(async (userId: string): Promise<boolean> => {
  const user = await db.query.users.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
    columns: { supporter: true },
  })
  return user?.supporter || false
})

// Get user statistics (total score, questions, tests attempted)
export const getUserStats = cache(
  async (
    userId: string
  ): Promise<{
    totalScore: number
    totalQuestions: number
    testsAttempted: number
  }> => {
    const result = await db
      .select({
        totalScore: users.totalScore,
        totalQuestions: users.totalQuestions,
        testsAttempted: users.testsAttempted,
      })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1)

    return {
      totalScore: result[0]?.totalScore || 0,
      totalQuestions: result[0]?.totalQuestions || 0,
      testsAttempted: result[0]?.testsAttempted || 0,
    }
  }
)

// Get all forum posts with their comments, ordered by creation date
export const getAllForumPosts = cache(async (): Promise<ForumPost[]> => {
  const posts = await db.query.forumPosts.findMany({
    orderBy: (model, { desc }) => desc(model.createdAt),
    with: {
      comments: {
        orderBy: (model, { asc }) => asc(model.createdAt),
      },
    },
  })

  return posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    comments: post.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  }))
})

// Get a specific forum post with its comments
export const getForumPostById = cache(async (postId: string): Promise<ForumPost | null> => {
  const post = await db.query.forumPosts.findFirst({
    where: (model, { eq }) => eq(model.id, postId),
    with: {
      comments: {
        orderBy: (model, { asc }) => asc(model.createdAt),
      },
    },
  })

  if (!post) return null

  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    comments: post.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  }
})

// Create a new forum post
export const createForumPost = cache(
  async (data: { title: string; content: string; authorId: string; authorName: string; readonly: boolean }) => {
    const post = await db
      .insert(forumPosts)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return post[0]
  }
)

// Delete a forum post and its associated comments
export const deleteForumPost = cache(async (postId: string) => {
  await db.delete(forumPosts).where(eq(forumPosts.id, postId))
})

// Create a new comment on a forum post
export const createForumComment = cache(
  async (data: { postId: string; content: string; authorId: string; authorName: string }) => {
    const comment = await db
      .insert(forumComments)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning()

    return comment[0]
  }
)

// Delete a specific comment
export const deleteForumComment = cache(async (commentId: string) => {
  await db.delete(forumComments).where(eq(forumComments.id, commentId))
})

// Get the timestamp of user's last forum post
export const getLastUserPostTime = cache(async (userId: string): Promise<Date | null> => {
  const [lastPost] = await db
    .select({ createdAt: forumPosts.createdAt })
    .from(forumPosts)
    .where(eq(forumPosts.authorId, userId))
    .orderBy(desc(forumPosts.createdAt))
    .limit(1)

  return lastPost?.createdAt ?? null
})

// Get the timestamp of user's last comment
export const getLastUserCommentTime = cache(async (userId: string): Promise<Date | null> => {
  const [lastComment] = await db
    .select({ createdAt: forumComments.createdAt })
    .from(forumComments)
    .where(eq(forumComments.authorId, userId))
    .orderBy(desc(forumComments.createdAt))
    .limit(1)

  return lastComment?.createdAt ?? null
})

// Get userId from stripe support payments 
export const getStripeSupportPayments = cache(async (): Promise<Payment[]> => {
  const payments = await db.query.payments.findMany()
  return payments
})

// Get supporters userId from stripe support payments
export const getSupportersUserIds = cache(async (): Promise<string[]> => {
  const payments = await getStripeSupportPayments()
  const supportersUserId = payments.map((payment) => payment.userId)
  return supportersUserId
})

// Get supporters usernames 
export const getSupportersUsernames = cache(async (): Promise<Supporter[]> => {
  const supportersIds = await getSupportersUserIds()
  
  if(supportersIds.length === 0) return []

  const supporters = await db.query.users.findMany({
    where: (users, {inArray}) => inArray(users.userId, supportersIds ),
    columns: {
      username: true,
      id: true
    }
  }) 

  return supporters.map((user) => ({id: user.id, username: user.username}))
})




