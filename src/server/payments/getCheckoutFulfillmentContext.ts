import 'server-only'
import { isCheckoutSessionValidForOrder } from '@/helpers/isCheckoutSessionValidForOrder'
import stripe from '@/lib/stripeClient'
import { getCheckoutOrderById } from '@/server/payments/checkoutOrders'
import { getCheckoutSessionSnapshot } from '@/server/payments/getCheckoutSessionSnapshot'
import { CreateCheckoutSchema } from '@/server/schema'
import { getVerifiedStripeOffer } from '@/server/stripeOffer'
import type { CheckoutFulfillmentContext } from '@/types/paymentTypes'

export async function getCheckoutFulfillmentContext(
  sessionId: string
): Promise<CheckoutFulfillmentContext> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price'],
  })
  const snapshot = getCheckoutSessionSnapshot(session)
  const orderId = session.metadata?.orderId ?? null
  const order = orderId ? await getCheckoutOrderById(orderId) : null
  if (orderId && !order) {
    throw new Error(`Checkout Session ${sessionId} references an unknown order`)
  }

  const legacyKey = CreateCheckoutSchema.safeParse({
    offerKey: session.metadata?.offerKey,
  })
  const legacyOffer = !order && legacyKey.success
    ? await getVerifiedStripeOffer(legacyKey.data.offerKey)
    : null
  const userId = order?.userId ?? snapshot.clientReferenceId
  const customerId = order?.stripeCustomerId ?? snapshot.customerId

  if (!userId || !customerId || (!order && !legacyOffer)) {
    throw new Error(`Checkout Session ${sessionId} has no trusted purchase owner`)
  }

  const valid = isCheckoutSessionValidForOrder(snapshot, {
    sessionId: order?.stripeSessionId ?? null,
    userId,
    customerId,
    priceId: order?.stripePriceId ?? legacyOffer!.priceId,
    amount: order?.amountTotal ?? legacyOffer!.amount,
    currency: order?.currency ?? legacyOffer!.currency,
  })
  if (!valid) throw new Error(`Checkout Session ${sessionId} failed catalog validation`)

  return {
    orderId: order?.id ?? null,
    userId,
    offerKey: order?.offerKey ?? legacyOffer!.key,
    courseSlug: order?.courseSlug ?? legacyOffer!.courseSlug,
    accessTier: order?.accessTier ?? legacyOffer!.accessTier,
    stripeCustomerId: customerId,
    snapshot,
  }
}
