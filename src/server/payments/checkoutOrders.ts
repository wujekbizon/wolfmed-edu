import 'server-only'
import { and, eq, inArray, lte } from 'drizzle-orm'
import { ACTIVE_CHECKOUT_ORDER_STATUSES } from '@/constants/checkout'
import { getCheckoutOrderDeduplicationKey } from '@/helpers/getCheckoutOrderDeduplicationKey'
import { getCheckoutOrderExpiry } from '@/helpers/getCheckoutOrderExpiry'
import { db } from '@/server/db/index'
import { checkoutOrders } from '@/server/db/schema'
import type { CheckoutOrderStatus, PaymentOffer } from '@/types/paymentTypes'

type VerifiedOffer = PaymentOffer & { priceId: string }

export async function getOrCreateCheckoutOrder(userId: string, offer: VerifiedOffer) {
  const deduplicationKey = getCheckoutOrderDeduplicationKey(
    userId,
    offer.courseSlug,
    offer.purchaseModel
  )
  const now = new Date()

  await db.update(checkoutOrders).set({
    status: 'EXPIRED',
    deduplicationKey: null,
    updatedAt: now,
  }).where(and(
    eq(checkoutOrders.deduplicationKey, deduplicationKey),
    inArray(checkoutOrders.status, [...ACTIVE_CHECKOUT_ORDER_STATUSES]),
    lte(checkoutOrders.expiresAt, now)
  ))

  const [inserted] = await db.insert(checkoutOrders).values({
    userId,
    offerKey: offer.key,
    courseSlug: offer.courseSlug,
    accessTier: offer.accessTier,
    stripePriceId: offer.priceId,
    amountTotal: offer.amount,
    currency: offer.currency,
    purchaseModel: offer.purchaseModel,
    status: 'CREATING',
    deduplicationKey,
    expiresAt: getCheckoutOrderExpiry(now),
  }).onConflictDoNothing({
    target: checkoutOrders.deduplicationKey,
  }).returning()

  if (inserted) return inserted

  const [existing] = await db.select().from(checkoutOrders)
    .where(eq(checkoutOrders.deduplicationKey, deduplicationKey)).limit(1)

  if (!existing) throw new Error('Active checkout order could not be resolved')
  return existing
}

export async function attachCheckoutSession(
  orderId: string,
  sessionId: string,
  customerId: string,
  expiresAt: Date
) {
  await db.update(checkoutOrders).set({
    status: 'OPEN',
    stripeSessionId: sessionId,
    stripeCustomerId: customerId,
    expiresAt,
    updatedAt: new Date(),
  }).where(eq(checkoutOrders.id, orderId))
}

export async function markCheckoutOrderStatus(
  orderId: string,
  status: CheckoutOrderStatus,
  releaseDeduplicationKey = false
) {
  await db.update(checkoutOrders).set({
    status,
    ...(releaseDeduplicationKey ? { deduplicationKey: null } : {}),
    updatedAt: new Date(),
  }).where(eq(checkoutOrders.id, orderId))
}

export async function getCheckoutOrderForUser(orderId: string, userId: string) {
  const [order] = await db.select().from(checkoutOrders).where(and(
    eq(checkoutOrders.id, orderId),
    eq(checkoutOrders.userId, userId)
  )).limit(1)
  return order ?? null
}

export async function getCheckoutOrderById(orderId: string) {
  const [order] = await db.select().from(checkoutOrders)
    .where(eq(checkoutOrders.id, orderId)).limit(1)
  return order ?? null
}
