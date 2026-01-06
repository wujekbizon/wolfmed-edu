import 'server-only'
import { UserData } from '@/types/dataTypes'
import { db } from '@/server/db/index'
import { eq } from 'drizzle-orm'
import { payments, processedEvents, subscriptions, users, userLimits } from './db/schema'
import { Payment, Subscription } from '@/types/stripeTypes'

export async function insertUserToDb(userData: UserData): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // Insert user
      await tx.insert(users).values(userData)

    })
  } catch (error) {
    console.error('Error inserting users:', error)
    // Ensure the error is actually an Error object before re-throwing
    if (error instanceof Error) {
      throw new Error(`Wystąpił błąd podczas tworzenia konta użytkownika: ${error.message}`)
    } else {
      // Handle non-Error type errors
      console.error('Unexpected error type:', error)
      throw new Error('Wystąpił nieoczekiwany błąd podczas tworzenia konta')
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
      throw new Error(`Wystąpił błąd podczas usuwania użytkownika: ${error.message}`)
    } else {
      // Handle non-Error type errors
      console.error('Unexpected error type:', error)
      throw new Error('Wystąpił nieoczekiwany błąd podczas usuwania użytkownika')
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
    throw new Error('Błąd aktualizacji limitu testów')
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

      // Update the user's test limit
      await tx.update(users).set({ testLimit: 1000 }).where(eq(users.userId, id))

      // CREATE userLimits for the new supporter
      await tx.insert(userLimits).values({
        userId: id,
        storageLimit: 20_000_000,
        storageUsed: 0,
      })

      // Log the processed event for idempotency
      await tx.insert(processedEvents).values({
        eventId,
        userId: id,
      })
    })

    console.log(`User with ID: ${id} is now a supporter.`)
  } catch (error) {
    console.error(`Failed to update supporter status for user with ID: ${id}`, error)
    throw new Error('Błąd aktualizacji statusu wspierającego')
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
      createdAt: createdAt,
    })
    console.log(`Subscription for user ${userId} inserted successfully.`)
  } catch (error) {
    console.error(`Failed to insert subscription for user ${userId}:`, error)
    throw new Error('Błąd dodawania subskrypcji')
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
      createdAt: createdAt,
    })
  } catch (error) {
    console.error(`Failed to insert payment for user ${userId}:`, error)
    throw new Error('Błąd dodawania płatności')
  }
}
