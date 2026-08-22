import 'server-only'
import { eq, sql } from 'drizzle-orm'
import { isSubscriptionAccessActive } from '@/helpers/isSubscriptionAccessActive'
import { canGrantPaymentAccess } from '@/helpers/canGrantPaymentAccess'
import { getAccountDeletionCleanupAfter } from '@/helpers/getAccountDeletionCleanupAfter'
import { db } from '@/server/db/index'
import {
  checkoutOrders,
  processedEvents,
  userLimits,
} from '@/server/db/schema'
import { upsertSubscriptionEnrollment } from '@/server/payments/upsertSubscriptionEnrollment'
import { upsertSubscriptionPayment } from '@/server/payments/upsertSubscriptionPayment'
import { upsertSubscriptionRecord } from '@/server/payments/upsertSubscriptionRecord'
import { getVerifiedScheduledSubscriptionChange } from '@/server/payments/getVerifiedScheduledSubscriptionChange'
import type {
  SubscriptionCheckoutOrder,
  SubscriptionSnapshot,
  VerifiedPaymentOffer,
} from '@/types/paymentTypes'

export async function syncSubscriptionLifecycle(
  eventId: string,
  eventType: string,
  snapshot: SubscriptionSnapshot,
  order: SubscriptionCheckoutOrder,
  offer: VerifiedPaymentOffer
): Promise<void> {
  const active = isSubscriptionAccessActive(snapshot)
  const scheduledChange = await getVerifiedScheduledSubscriptionChange(snapshot, offer)
  const ownerUserId = canGrantPaymentAccess(order.userId, order.ownerDeletedAt)
    ? order.userId
    : null
  const now = new Date()
  const ownerDeletedAt = ownerUserId ? null : order.ownerDeletedAt ?? now
  const cleanupAfter = ownerUserId
    ? null
    : order.cleanupAfter ?? getAccountDeletionCleanupAfter(ownerDeletedAt ?? now)

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(
      ${`subscription:${snapshot.id}`}, 0
    ))`)
    const [event] = await tx.insert(processedEvents).values({
      eventId,
      userId: ownerUserId,
      eventType,
      stripeObjectId: snapshot.id,
      orderId: ownerUserId ? order.id : null,
      ownerDeletedAt,
      cleanupAfter,
    }).onConflictDoNothing({ target: processedEvents.eventId }).returning({
      id: processedEvents.id,
    })
    if (!event) return

    const subscription = await upsertSubscriptionRecord(
      tx,
      snapshot,
      order,
      offer,
      scheduledChange,
      now
    )
    await upsertSubscriptionPayment(tx, snapshot, order, offer, now)
    if (ownerUserId) {
      await upsertSubscriptionEnrollment(tx, snapshot, order, offer, active, now)
    }
    await tx.update(checkoutOrders).set({
      status: active ? 'PAID' : snapshot.status === 'incomplete' ? 'PROCESSING' : 'FAILED',
      ...(active ? { deduplicationKey: null } : {}),
      updatedAt: now,
    }).where(eq(checkoutOrders.id, order.id))
    if (active && ownerUserId) {
      await tx.insert(userLimits).values({ userId: ownerUserId })
        .onConflictDoNothing({ target: userLimits.userId })
    }
    await tx.update(processedEvents).set({ subscriptionRecordId: subscription.id })
      .where(eq(processedEvents.id, event.id))
  })
}
