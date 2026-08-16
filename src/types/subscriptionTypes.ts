import type {
  CheckoutPurchaseModel,
  PaymentOffer,
  PaymentOfferKey,
  VerifiedPaymentOffer,
} from '@/types/paymentOfferTypes'

export type SubscriptionCheckoutEligibility = 'ALLOWED' | 'ALREADY_OWNED'

export type StripeSubscriptionEventType =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.paid'
  | 'invoice.payment_failed'

export type StripeSubscriptionScheduleEventType =
  | 'subscription_schedule.created'
  | 'subscription_schedule.updated'
  | 'subscription_schedule.released'
  | 'subscription_schedule.canceled'
  | 'subscription_schedule.completed'
  | 'subscription_schedule.aborted'

export type ScheduledSubscriptionChangeSnapshot = {
  scheduleId: string
  priceId: string
  effectiveAt: Date
}

export type VerifiedScheduledSubscriptionChange =
  ScheduledSubscriptionChangeSnapshot & {
    offer: VerifiedPaymentOffer
  }

export type SubscriptionPlanChange = {
  courseSlug: PaymentOffer['courseSlug']
  targetOfferKey: PaymentOfferKey
  targetAccessTier: PaymentOffer['accessTier']
  effectiveAt: Date
}

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
  scheduleId: string | null
  scheduledChange: ScheduledSubscriptionChangeSnapshot | null
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
  userId: string | null
  stripeSessionId: string | null
  ownerDeletedAt: Date | null
  cleanupAfter: Date | null
}
