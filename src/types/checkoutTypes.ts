import type {
  CheckoutPurchaseModel,
  PaymentOffer,
  PaymentOfferKey,
} from '@/types/paymentOfferTypes'

export type CheckoutOrderStatus =
  | 'CREATING'
  | 'OPEN'
  | 'PROCESSING'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELED'
  | 'EXPIRED'
  | 'FAILED'

export type CheckoutStartResult =
  | { status: 'READY'; url: string }
  | { status: 'ACTIVE_CONFLICT' }
  | { status: 'ALREADY_OWNED' }
  | { status: 'NOT_ELIGIBLE' }
  | { status: 'MODEL_CONFLICT' }
  | { status: 'UPGRADE_REQUIRED' }
  | { status: 'COMPLETED' }

export type LifetimeCheckoutEligibility =
  | 'ALLOWED'
  | 'ALREADY_OWNED'
  | 'NOT_ELIGIBLE'
  | 'UPGRADE_REQUIRED'

export type CheckoutSessionSnapshot = {
  id: string
  mode: string | null
  status: string | null
  paymentStatus: string
  amountTotal: number | null
  currency: string | null
  clientReferenceId: string | null
  customerId: string | null
  paymentIntentId: string | null
  subscriptionId: string | null
  invoiceId: string | null
  createdAt: Date
  expiresAt: Date
  lineItems: Array<{ priceId: string | null; quantity: number | null }>
}

export type CheckoutSessionExpectation = {
  sessionId: string | null
  userId: string
  customerId: string | null
  priceId: string
  amount: number
  currency: string
  purchaseModel: CheckoutPurchaseModel
}

export type StripeCheckoutEventType =
  | 'checkout.session.completed'
  | 'checkout.session.async_payment_succeeded'
  | 'checkout.session.async_payment_failed'

export type CheckoutPaymentState = 'paid' | 'failed' | 'processing' | 'invalid'

export type CheckoutFulfillmentContext = {
  orderId: string | null
  orderStatus: CheckoutOrderStatus | null
  userId: string
  offerKey: PaymentOfferKey
  courseSlug: PaymentOffer['courseSlug']
  accessTier: PaymentOffer['accessTier']
  entitlementSourceType: PaymentOffer['entitlementSourceType']
  purchaseModel: CheckoutPurchaseModel
  stripeCustomerId: string
  snapshot: CheckoutSessionSnapshot
}
