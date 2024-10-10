import 'server-only'
import { UserData } from '@/types/dataTypes'
import { db } from '@/server/db/index'
import { eq } from 'drizzle-orm'
import { payments, processedEvents, subscriptions, users } from './db/schema'
import { Payment, Subscription } from '@/types/stripeTypes'

export async function insertUserToDb(userData: UserData): Promise<void> {
  try {
    await db.insert(users).values(userData)
  } catch (error) {
    console.error('Error inserting users:', error)
    // Ensure the error is actually an Error object before re-throwing
    if (error instanceof Error) {
      throw new Error(`An error occurred while inserting the user into the database: ${error.message}`)
    } else {
      // Handle non-Error type errors
      console.error('Unexpected error type:', error)
      // DO IT LATER: throw a custom error or handle it differently here
    }
  }
}

export async function deleteUserFromDb(id: string): Promise<void> {
  try {
    await db.delete(users).where(eq(users.userId, id))
  } catch (error) {
    console.error('Error deleting user:', error)
    // Ensure the error is actually an Error object before re-throwing
    if (error instanceof Error) {
      throw new Error(`An error occurred while deleting the user from the database: ${error.message}`)
    } else {
      // Handle non-Error type errors
      console.error('Unexpected error type:', error)
      // DO IT LATER: throw a custom error or handle it differently here
    }
  }
}

export async function updateTestLimit(id: string, testLimit: number, eventId: string) {
  try {
    // Check if the event has already been processed (idempotency)
    const existingEvent = await db.query.processedEvents.findFirst({
      where: (model, { eq }) => eq(model.eventId, eventId),
    })

    if (existingEvent) {
      console.log(`Event ${eventId} already processed`)
      return
    }

    // Use a transaction to update the user and record the event
    await db.transaction(async (tx) => {
      // Update the user's testLimit
      await tx.update(users).set({ testLimit }).where(eq(users.userId, id))

      // Log the processed event for idempotency
      await tx.insert(processedEvents).values({
        eventId,
        userId: id,
      })
    })

    console.log(`Updated testLimit to ${testLimit} for user with ID: ${id}`)
  } catch (error) {
    console.error(`Failed to update testLimit for user with ID: ${id}`, error)
    throw new Error('Error updating test limit')
  }
}

export async function updateUserSupporterStatus(id: string, eventId: string) {
  try {
    // Check if the event has already been processed (idempotency)
    const existingEvent = await db.query.processedEvents.findFirst({
      where: (model, { eq }) => eq(model.eventId, eventId),
    })

    if (existingEvent) {
      console.log(`Event ${eventId} already processed`)
      return
    }

    // Use a transaction to update the user and record the event
    await db.transaction(async (tx) => {
      // Update the user's supporter status
      await tx.update(users).set({ supporter: true }).where(eq(users.userId, id))

      // Log the processed event for idempotency
      await tx.insert(processedEvents).values({
        eventId,
        userId: id,
      })
    })

    console.log(`User with ID: ${id} is now a supporter.`)
  } catch (error) {
    console.error(`Failed to update supporter status for user with ID: ${id}`, error)
    throw new Error('Error updating supporter status')
  }
}

export async function insertSubscription({
  userId,
  sessionId,
  amountTotal,
  currency,
  customerEmail,
  invoiceId,
  paymentStatus,
  subscriptionId,
  customerId,
  createdAt,
}: Subscription) {
  try {
    await db.insert(subscriptions).values({
      userId,
      sessionId,
      amountTotal,
      currency,
      customerEmail,
      customerId,
      invoiceId,
      paymentStatus,
      subscriptionId,
      createdAt: new Date(createdAt * 1000),
    })
    console.log(`Subscription for user ${userId} inserted successfully.`)
  } catch (error) {
    console.error(`Failed to insert subscription for user ${userId}:`, error)
    throw new Error('Error inserting subscription')
  }
}

export async function insertPayment({
  userId,
  amountTotal,
  currency,
  customerEmail,
  paymentStatus,
  createdAt,
}: Payment) {
  try {
    await db.insert(payments).values({
      userId,
      amountTotal,
      currency,
      customerEmail,
      paymentStatus,
      createdAt: new Date(createdAt * 1000),
    })
  } catch (error) {
    console.error(`Failed to insert payment for user ${userId}:`, error)
    throw new Error('Error inserting payment')
  }
}
