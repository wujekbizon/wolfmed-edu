import 'server-only'
import { UserData } from '@/types/dataTypes'
import { db } from '@/server/db/index'
import { eq } from 'drizzle-orm'
import { processedEvents, users } from './db/schema'

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
