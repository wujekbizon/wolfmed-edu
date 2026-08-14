import 'server-only'
import { isStripeInvalidRequestError } from '@/helpers/isStripeInvalidRequestError'
import { resolveCheckoutResultStatus } from '@/helpers/resolveCheckoutResultStatus'
import { getCheckoutFulfillmentContext } from '@/server/payments/getCheckoutFulfillmentContext'
import { syncCheckoutSession } from '@/server/payments/syncCheckoutSession'
import { getCheckoutOrderById } from '@/server/payments/checkoutOrders'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import { syncSubscriptionLifecycle } from '@/server/payments/syncSubscriptionLifecycle'
import { isSubscriptionValidForOrder } from '@/helpers/isSubscriptionValidForOrder'
import { getCheckoutPaymentOutcome } from '@/helpers/getCheckoutPaymentOutcome'
import type { CheckoutResult } from '@/types/paymentTypes'

export async function getVerifiedCheckoutResult(
  currentUserId: string,
  sessionId: string
): Promise<CheckoutResult> {
  try {
    const context = await getCheckoutFulfillmentContext(sessionId)
    const status = resolveCheckoutResultStatus({
      currentUserId,
      checkoutUserId: context.userId,
      paymentStatus: context.snapshot.paymentStatus,
      sessionStatus: context.snapshot.status,
      orderStatus: context.orderStatus,
    })

    if (status === 'invalid') return { status }

    if (status !== 'failed') {
      const resultId = `success:${sessionId}:${context.snapshot.paymentStatus}`
      if (context.purchaseModel === 'subscription') {
        if (!context.orderId || !context.snapshot.subscriptionId) return { status: 'invalid' }
        const order = await getCheckoutOrderById(context.orderId)
        if (!order) return { status: 'invalid' }
        const snapshot = await getSubscriptionSnapshot(context.snapshot.subscriptionId)
        const offer = await getVerifiedSubscriptionOffer(snapshot.priceId)
        if (offer.key !== context.offerKey || !isSubscriptionValidForOrder(snapshot, {
          orderId: order.id,
          customerId: order.stripeCustomerId,
          courseSlug: order.courseSlug,
          purchaseModel: order.purchaseModel,
          offer,
        })) return { status: 'invalid' }
        await syncSubscriptionLifecycle(resultId, 'checkout.session.completed', snapshot, order, offer)
      } else {
        await syncCheckoutSession(resultId, 'checkout.session.completed', context)
      }
    }

    return {
      status,
      courseSlug: context.courseSlug,
      accessTier: context.accessTier,
      outcome: getCheckoutPaymentOutcome(
        context.purchaseModel,
        context.entitlementSourceType
      ),
    }
  } catch (error) {
    if (isStripeInvalidRequestError(error)) return { status: 'invalid' }
    console.error(`Checkout result verification failed for ${sessionId}:`, error)
    return { status: 'unavailable' }
  }
}
