import 'server-only'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'
import stripe from '@/lib/stripeClient'
import type { SubscriptionSnapshot } from '@/types/paymentTypes'

export async function getSubscriptionSnapshot(
  subscriptionId: string
): Promise<SubscriptionSnapshot> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const [item] = subscription.items.data
  if (!item || subscription.items.data.length !== 1 || item.quantity !== 1) {
    throw new Error(`Subscription ${subscriptionId} must contain one item`)
  }

  const invoiceId = getStripeObjectId(subscription.latest_invoice)
  const invoice = invoiceId
    ? await stripe.invoices.retrieve(invoiceId, {
        expand: ['payments.data.payment.payment_intent'],
      })
    : null
  const customerId = getStripeObjectId(subscription.customer)
  if (!customerId) throw new Error(`Subscription ${subscriptionId} has no Customer`)
  const invoicePayment = invoice?.payments?.data.find(
    (payment) => payment.payment.type === 'payment_intent'
  )

  return {
    id: subscription.id,
    itemId: item.id,
    customerId,
    priceId: item.price.id,
    status: subscription.status,
    amount: item.price.unit_amount ?? 0,
    currency: item.price.currency,
    currentPeriodStart: new Date(item.current_period_start * 1000),
    currentPeriodEnd: new Date(item.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
    endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
    latestInvoiceId: invoice?.id ?? null,
    latestInvoiceStatus: invoice?.status ?? null,
    latestInvoicePaid: invoice?.status === 'paid',
    latestInvoiceAmount: invoice
      ? (invoice.status === 'paid' ? invoice.amount_paid : invoice.amount_due)
      : null,
    latestInvoiceCurrency: invoice?.currency ?? null,
    latestPaymentIntentId: getStripeObjectId(
      invoicePayment?.payment.payment_intent ?? null
    ),
    orderId: subscription.metadata.orderId ?? null,
    createdAt: new Date(subscription.created * 1000),
  }
}
