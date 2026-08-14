import 'server-only'
import type Stripe from 'stripe'
import { getStripeEventSubscriptionId } from '@/helpers/getStripeEventSubscriptionId'
import { isSubscriptionValidForOrder } from '@/helpers/isSubscriptionValidForOrder'
import { getCheckoutOrderById } from '@/server/payments/checkoutOrders'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import { syncSubscriptionLifecycle } from '@/server/payments/syncSubscriptionLifecycle'

export async function processStripeSubscriptionEvent(event: Stripe.Event): Promise<void> {
  const subscriptionId = getStripeEventSubscriptionId(event)
  if (!subscriptionId) return

  const snapshot = await getSubscriptionSnapshot(subscriptionId)
  const offer = await getVerifiedSubscriptionOffer(snapshot.priceId)
  const order = snapshot.orderId ? await getCheckoutOrderById(snapshot.orderId) : null
  if (!order || order.purchaseModel !== 'subscription') {
    throw new Error(`Subscription ${subscriptionId} has no trusted order`)
  }
  if (!isSubscriptionValidForOrder(snapshot, {
    orderId: order.id,
    customerId: order.stripeCustomerId,
    courseSlug: order.courseSlug,
    purchaseModel: order.purchaseModel,
    offer,
  })) {
    throw new Error(`Subscription ${subscriptionId} failed catalog validation`)
  }

  await syncSubscriptionLifecycle(event.id, event.type, snapshot, order, offer)
}
