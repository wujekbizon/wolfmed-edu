import 'server-only'
import { isSubscriptionValidForOrder } from '@/helpers/isSubscriptionValidForOrder'
import { getCheckoutOrderById } from '@/server/payments/checkoutOrders'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import { syncSubscriptionLifecycle } from '@/server/payments/syncSubscriptionLifecycle'

export async function syncStripeSubscriptionById(
  eventId: string,
  eventType: string,
  subscriptionId: string
): Promise<void> {
  const snapshot = await getSubscriptionSnapshot(subscriptionId)
  const order = snapshot.orderId ? await getCheckoutOrderById(snapshot.orderId) : null
  if (!order) return

  const offer = await getVerifiedSubscriptionOffer(snapshot.priceId)
  if (order.purchaseModel !== 'subscription' || !isSubscriptionValidForOrder(
    snapshot,
    {
      orderId: order.id,
      customerId: order.stripeCustomerId,
      courseSlug: order.courseSlug,
      purchaseModel: order.purchaseModel,
      offer,
    }
  )) {
    throw new Error(`Subscription ${subscriptionId} failed catalog validation`)
  }

  await syncSubscriptionLifecycle(eventId, eventType, snapshot, order, offer)
}
