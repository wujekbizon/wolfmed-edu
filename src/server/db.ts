import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { users } from '@/server/db/schema'
import { eraseUserMemory } from '@/server/memory/erase'
import type { UserData } from '@/types/dataTypes'
import { cancelUserSubscriptions } from '@/server/payments/cancelUserSubscriptions'

export async function insertUserToDb(userData: UserData): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(users).values(userData)
  })
}

export async function deleteUserFromDb(userId: string): Promise<void> {
  await cancelUserSubscriptions(userId)
  await eraseUserMemory(userId)
  await db.delete(users).where(eq(users.userId, userId))
}
