import 'server-only'
import { and, eq } from 'drizzle-orm'
import { isStripeInvalidRequestError } from '@/helpers/isStripeInvalidRequestError'
import { isSubscriptionValidForOrder } from '@/helpers/isSubscriptionValidForOrder'
import { resolveSubscriptionResultStatus } from '@/helpers/resolveSubscriptionResultStatus'
import { db } from '@/server/db/index'
import { subscriptions } from '@/server/db/schema'
import { getCheckoutOrderById } from '@/server/payments/checkoutOrders'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import { syncSubscriptionLifecycle } from '@/server/payments/syncSubscriptionLifecycle'
import type { CheckoutResult } from '@/types/paymentTypes'

export async function getVerifiedSubscriptionUpgradeResult(
  userId: string,
  subscriptionId: string
): Promise<CheckoutResult> {
  try {
    const [local] = await db.select().from(subscriptions).where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.subscriptionId, subscriptionId)
    )).limit(1)
    if (!local?.orderId) return { status: 'invalid' }

    const [order, snapshot] = await Promise.all([
      getCheckoutOrderById(local.orderId),
      getSubscriptionSnapshot(subscriptionId),
    ])
    if (!order || order.userId !== userId) return { status: 'invalid' }

    const offer = await getVerifiedSubscriptionOffer(snapshot.priceId)
    const valid = offer.accessTier === 'premium' && isSubscriptionValidForOrder(
      snapshot,
      {
        orderId: order.id,
        customerId: order.stripeCustomerId,
        courseSlug: order.courseSlug,
        purchaseModel: order.purchaseModel,
        offer,
      }
    )
    if (!valid) return { status: 'invalid' }

    const status = resolveSubscriptionResultStatus(snapshot)
    if (status !== 'failed') {
      const resultId = `success:upgrade:${snapshot.id}:${snapshot.latestInvoiceId ?? snapshot.priceId}`
      await syncSubscriptionLifecycle(resultId, 'portal.subscription.updated', snapshot, order, offer)
    }

    return {
      status,
      courseSlug: offer.courseSlug,
      accessTier: offer.accessTier,
      outcome: 'subscription_upgrade',
    }
  } catch (error) {
    if (isStripeInvalidRequestError(error)) return { status: 'invalid' }
    console.error(`Subscription upgrade verification failed for ${subscriptionId}:`, error)
    return { status: 'unavailable' }
  }
}
