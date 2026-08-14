import 'server-only'
import { eq, sql } from 'drizzle-orm'
import { isSubscriptionAccessActive } from '@/helpers/isSubscriptionAccessActive'
import { db } from '@/server/db/index'
import {
  checkoutOrders,
  processedEvents,
  userLimits,
} from '@/server/db/schema'
import { upsertSubscriptionEnrollment } from '@/server/payments/upsertSubscriptionEnrollment'
import { upsertSubscriptionPayment } from '@/server/payments/upsertSubscriptionPayment'
import { upsertSubscriptionRecord } from '@/server/payments/upsertSubscriptionRecord'
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
  const now = new Date()

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(
      ${`subscription:${snapshot.id}`}, 0
    ))`)
    const [event] = await tx.insert(processedEvents).values({
      eventId,
      userId: order.userId,
      eventType,
      stripeObjectId: snapshot.id,
      orderId: order.id,
    }).onConflictDoNothing({ target: processedEvents.eventId }).returning({
      id: processedEvents.id,
    })
    if (!event) return

    const subscription = await upsertSubscriptionRecord(tx, snapshot, order, offer, now)
    await upsertSubscriptionPayment(tx, snapshot, order, offer, now)
    await upsertSubscriptionEnrollment(tx, snapshot, order, offer, active, now)
    await tx.update(checkoutOrders).set({
      status: active ? 'PAID' : snapshot.status === 'incomplete' ? 'PROCESSING' : 'FAILED',
      ...(active ? { deduplicationKey: null } : {}),
      updatedAt: now,
    }).where(eq(checkoutOrders.id, order.id))
    if (active) {
      await tx.insert(userLimits).values({ userId: order.userId })
        .onConflictDoNothing({ target: userLimits.userId })
    }
    await tx.update(processedEvents).set({ subscriptionRecordId: subscription.id })
      .where(eq(processedEvents.id, event.id))
  })
}
