import 'server-only'
import { db } from '@/server/db/index'
import { users } from '@/server/db/schema'
import { deleteUserAccount } from '@/server/account-deletion/deleteUserAccount'
import type { UserData } from '@/types/dataTypes'

export async function insertUserToDb(userData: UserData): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(users).values(userData)
  })
}

export async function deleteUserFromDb(userId: string): Promise<void> {
  await deleteUserAccount(userId)
}
