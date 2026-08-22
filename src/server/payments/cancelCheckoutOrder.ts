import 'server-only'
import stripe from '@/lib/stripeClient'
import {
  getCheckoutOrderForUser,
  markCheckoutOrderStatus,
} from '@/server/payments/checkoutOrders'

export async function cancelCheckoutOrder(orderId: string, userId: string): Promise<void> {
  const order = await getCheckoutOrderForUser(orderId, userId)
  if (!order || order.status === 'PAID' || order.status === 'COMPLETED') return

  if (!order.stripeSessionId) {
    await markCheckoutOrderStatus(order.id, 'CANCELED', true)
    return
  }

  const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId)
  if (session.status === 'complete') {
    await markCheckoutOrderStatus(order.id, 'COMPLETED')
    return
  }
  if (session.status === 'expired') {
    await markCheckoutOrderStatus(order.id, 'EXPIRED', true)
    return
  }

  await stripe.checkout.sessions.expire(session.id)
  await markCheckoutOrderStatus(order.id, 'CANCELED', true)
}
