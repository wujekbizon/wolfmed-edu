import type {
  CheckoutPurchaseModel,
  PaymentOffer,
} from '@/types/paymentOfferTypes'

export type SubscriptionCheckoutEligibility = 'ALLOWED' | 'ALREADY_OWNED'

export type StripeSubscriptionEventType =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.paid'
  | 'invoice.payment_failed'

export type SubscriptionSnapshot = {
  id: string
  itemId: string
  customerId: string
  priceId: string
  status: string
  amount: number
  currency: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  cancelAt: Date | null
  canceledAt: Date | null
  endedAt: Date | null
  latestInvoiceId: string | null
  latestInvoiceStatus: string | null
  latestInvoicePaid: boolean
  latestInvoiceAmount: number | null
  latestInvoiceCurrency: string | null
  latestPaymentIntentId: string | null
  orderId: string | null
  createdAt: Date
}

export type SubscriptionExpectation = {
  orderId: string
  customerId: string | null
  courseSlug: PaymentOffer['courseSlug']
  purchaseModel: CheckoutPurchaseModel
  offer: PaymentOffer & { priceId: string }
}

export type SubscriptionCheckoutOrder = {
  id: string
  userId: string
  stripeSessionId: string | null
}
