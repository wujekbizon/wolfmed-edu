import 'server-only'
import { eq, sql } from 'drizzle-orm'
import {
  checkoutOrders,
  payments,
  processedEvents,
  subscriptions,
} from '@/server/db/schema'
import type { PaymentTransaction } from '@/types/dbTypes'

export async function pseudonymizeBillingRecords(
  tx: PaymentTransaction,
  userId: string,
  deletedAt: Date,
  cleanupAfter: Date
): Promise<void> {
  await tx.update(payments).set({
    userId: null,
    orderId: null,
    customerEmail: null,
    stripeCustomerId: null,
    pseudonymizedAt: deletedAt,
    retentionUntil: sql`date_trunc('year', COALESCE(
      ${payments.createdAt}, ${deletedAt}
    )) + interval '7 years' - interval '1 millisecond'`,
  }).where(eq(payments.userId, userId))

  await tx.update(subscriptions).set({
    userId: null,
    orderId: null,
    customerEmail: null,
    ownerDeletedAt: deletedAt,
    cleanupAfter,
    updatedAt: deletedAt,
  }).where(eq(subscriptions.userId, userId))

  await tx.update(processedEvents).set({
    userId: null,
    orderId: null,
    paymentId: null,
    subscriptionRecordId: null,
    ownerDeletedAt: deletedAt,
    cleanupAfter,
  }).where(eq(processedEvents.userId, userId))

  await tx.update(checkoutOrders).set({
    userId: null,
    deduplicationKey: null,
    ownerDeletedAt: deletedAt,
    cleanupAfter,
    updatedAt: deletedAt,
  }).where(eq(checkoutOrders.userId, userId))
}
