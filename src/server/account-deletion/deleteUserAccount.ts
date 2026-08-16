import 'server-only'
import { eq } from 'drizzle-orm'
import { UTApi } from 'uploadthing/server'
import { getAccountDeletionCleanupAfter } from '@/helpers/getAccountDeletionCleanupAfter'
import { deleteStripeCustomer } from '@/helpers/deleteStripeCustomer'
import stripe from '@/lib/stripeClient'
import { anonymizeEditorialContent } from '@/server/account-deletion/anonymizeEditorialContent'
import { pseudonymizeBillingRecords } from '@/server/account-deletion/pseudonymizeBillingRecords'
import { db } from '@/server/db/index'
import { lectures, materials, users } from '@/server/db/schema'
import { eraseUserMemoryInTransaction } from '@/server/memory/erase'

const utapi = new UTApi()

export async function deleteUserAccount(userId: string): Promise<void> {
  const [account] = await db.select({
    stripeCustomerId: users.stripeCustomerId,
  }).from(users).where(eq(users.userId, userId)).limit(1)
  if (!account) return

  const [materialFiles, lectureFiles] = await Promise.all([
    db.select({ key: materials.key }).from(materials)
      .where(eq(materials.userId, userId)),
    db.select({ key: lectures.audioKey }).from(lectures)
      .where(eq(lectures.userId, userId)),
  ])

  await deleteStripeCustomer(
    account.stripeCustomerId,
    (customerId) => stripe.customers.del(customerId)
  )

  const fileKeys = [...materialFiles, ...lectureFiles].map(({ key }) => key)
  if (fileKeys.length > 0) await utapi.deleteFiles(fileKeys)

  const deletedAt = new Date()
  const cleanupAfter = getAccountDeletionCleanupAfter(deletedAt)
  const erasedUserId = `deleted:${crypto.randomUUID()}`

  await db.transaction(async (tx) => {
    await pseudonymizeBillingRecords(tx, userId, deletedAt, cleanupAfter)
    await anonymizeEditorialContent(tx, userId, erasedUserId)
    await eraseUserMemoryInTransaction(tx, userId, erasedUserId)
    await tx.delete(users).where(eq(users.userId, userId))
  })
}
