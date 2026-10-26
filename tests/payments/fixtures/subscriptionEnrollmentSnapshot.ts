import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import type { SubscriptionCheckoutOrder, SubscriptionSnapshot } from '@/types/paymentTypes'

export const offer = {
  ...PAYMENT_OFFERS.opiekun_premium_monthly,
  priceId: 'price_1', productId: 'prod_1', taxBehavior: null,
}
export const order: SubscriptionCheckoutOrder = {
  id: 'order_1', userId: 'user_1', stripeSessionId: null,
  ownerDeletedAt: null, cleanupAfter: null,
}
export const snapshot: SubscriptionSnapshot = {
  id: 'sub_1', itemId: 'si_1', customerId: 'cus_1', priceId: 'price_1',
  status: 'past_due', amount: offer.amount, currency: 'pln',
  currentPeriodStart: new Date('2026-10-26T12:31:05Z'),
  currentPeriodEnd: new Date('2026-11-26T12:31:05Z'),
  scheduleId: null, scheduledChange: null, cancelAtPeriodEnd: false,
  cancelAt: null, canceledAt: null, endedAt: null,
  latestInvoiceId: 'in_1', latestInvoiceStatus: 'open', latestInvoicePaid: false,
  latestInvoiceAmount: offer.amount, latestInvoiceCurrency: 'pln',
  latestPaymentIntentId: 'pi_1', orderId: order.id,
  createdAt: new Date('2026-09-26T12:31:05Z'),
}
