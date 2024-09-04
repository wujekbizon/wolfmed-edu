import 'server-only'
import { UserData } from '@/types/dataTypes'
import { db } from '@/server/db/index'
import { eq } from 'drizzle-orm'
import { users } from './db/schema'

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
