import 'server-only'
import { eq, sql } from 'drizzle-orm'
import { resolveCheckoutPaymentState } from '@/helpers/resolveCheckoutPaymentState'
import { db } from '@/server/db/index'
import { syncLifetimeEnrollment } from '@/server/payments/syncLifetimeEnrollment'
import {
  checkoutOrders,
  payments,
  processedEvents,
  userLimits,
} from '@/server/db/schema'
import type {
  CheckoutFulfillmentContext,
  StripeCheckoutEventType,
} from '@/types/paymentTypes'

export async function syncCheckoutSession(
  eventId: string,
  eventType: StripeCheckoutEventType,
  context: CheckoutFulfillmentContext
): Promise<void> {
  const { snapshot } = context
  const paymentState = resolveCheckoutPaymentState(eventType, snapshot.paymentStatus)
  const paid = paymentState === 'paid'
  const failed = paymentState === 'failed'

  if (paymentState === 'invalid') {
    throw new Error(`Async success ${eventId} is not paid`)
  }
  if (paid && !snapshot.paymentIntentId) {
    throw new Error(`Paid Checkout Session ${snapshot.id} has no PaymentIntent`)
  }

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(
      ${`${context.userId}:${context.courseSlug}:lifetime`}, 0
    ))`)

    const [event] = await tx.insert(processedEvents).values({
      eventId,
      userId: context.userId,
      eventType,
      stripeObjectId: snapshot.id,
      orderId: context.orderId,
    }).onConflictDoNothing({ target: processedEvents.eventId }).returning({
      id: processedEvents.id,
    })

    if (!event) return

    const [payment] = await tx.insert(payments).values({
      userId: context.userId,
      orderId: context.orderId,
      offerKey: context.offerKey,
      accessTier: context.accessTier,
      amountTotal: snapshot.amountTotal!,
      currency: 'pln',
      paymentStatus: paymentState,
      courseSlug: context.courseSlug,
      stripeCustomerId: context.stripeCustomerId,
      sessionId: snapshot.id,
      paymentIntentId: snapshot.paymentIntentId,
      invoiceId: snapshot.invoiceId,
      createdAt: snapshot.createdAt,
    }).onConflictDoUpdate({
      target: payments.sessionId,
      set: {
        paymentStatus: paymentState,
        paymentIntentId: snapshot.paymentIntentId,
        invoiceId: snapshot.invoiceId,
      },
    }).returning({ id: payments.id })

    if (context.orderId) {
      await tx.update(checkoutOrders).set({
        status: failed ? 'FAILED' : paid ? 'PAID' : 'PROCESSING',
        ...(failed || paid ? { deduplicationKey: null } : {}),
        updatedAt: new Date(),
      }).where(eq(checkoutOrders.id, context.orderId))
    }

    if (paid && !failed) {
      await syncLifetimeEnrollment(tx, context)
      await tx.insert(userLimits).values({ userId: context.userId })
        .onConflictDoNothing({ target: userLimits.userId })
    }

    if (!payment) throw new Error(`Payment ${snapshot.id} was not persisted`)
    await tx.update(processedEvents).set({ paymentId: payment.id })
      .where(eq(processedEvents.id, event.id))
  })
}
