import 'server-only'
import type Stripe from 'stripe'
import { getCheckoutFulfillmentContext } from '@/server/payments/getCheckoutFulfillmentContext'
import { syncCheckoutSession } from '@/server/payments/syncCheckoutSession'
import { getCheckoutOrderById } from '@/server/payments/checkoutOrders'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import { syncSubscriptionLifecycle } from '@/server/payments/syncSubscriptionLifecycle'
import { isSubscriptionValidForOrder } from '@/helpers/isSubscriptionValidForOrder'
import type { StripeCheckoutEventType } from '@/types/paymentTypes'

export async function processStripeCheckoutEvent(event: Stripe.Event): Promise<void> {
  const eventType = event.type as StripeCheckoutEventType
  const session = event.data.object as Stripe.Checkout.Session
  const context = await getCheckoutFulfillmentContext(session.id)
  if (context.purchaseModel === 'subscription') {
    if (!context.orderId || !context.snapshot.subscriptionId) {
      throw new Error(`Subscription Checkout Session ${session.id} is incomplete`)
    }
    const order = await getCheckoutOrderById(context.orderId)
    if (!order) throw new Error(`Checkout order ${context.orderId} was not found`)
    const snapshot = await getSubscriptionSnapshot(context.snapshot.subscriptionId)
    const offer = await getVerifiedSubscriptionOffer(snapshot.priceId)
    if (offer.key !== context.offerKey || !isSubscriptionValidForOrder(snapshot, {
      orderId: order.id,
      customerId: order.stripeCustomerId,
      courseSlug: order.courseSlug,
      purchaseModel: order.purchaseModel,
      offer,
    })) {
      throw new Error(`Subscription Checkout Session ${session.id} failed validation`)
    }
    await syncSubscriptionLifecycle(event.id, event.type, snapshot, order, offer)
    return
  }
  await syncCheckoutSession(event.id, eventType, context)
}
