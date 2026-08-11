export type PaymentOfferKey =
  | 'opiekun_basic_lifetime'
  | 'opiekun_premium_lifetime'
  | 'opiekun_premium_upgrade'
  | 'pielegniarstwo_basic_lifetime'
  | 'pielegniarstwo_premium_lifetime'
  | 'pielegniarstwo_premium_upgrade'

export type LifetimeUpgradeOfferKey =
  | 'opiekun_premium_upgrade'
  | 'pielegniarstwo_premium_upgrade'

export type PaymentOffer = {
  key: PaymentOfferKey
  courseSlug: 'opiekun-medyczny' | 'pielegniarstwo'
  accessTier: 'basic' | 'premium'
  amount: number
  currency: 'pln'
  available: boolean
  entitlementSourceType: 'lifetime_purchase' | 'lifetime_upgrade'
  priceEnvName:
    | 'STRIPE_OPIEKUN_STANDARD_PRICE_ID'
    | 'STRIPE_OPIEKUN_PREMIUM_PRICE_ID'
    | 'STRIPE_OPIEKUN_PREMIUM_UPGRADE_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_BASIC_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_PREMIUM_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_PREMIUM_UPGRADE_PRICE_ID'
}

export type CheckoutPurchaseModel = 'lifetime' | 'subscription'

export type CheckoutOrderStatus =
  | 'CREATING'
  | 'OPEN'
  | 'PROCESSING'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELED'
  | 'EXPIRED'
  | 'FAILED'

export type EntitlementSourceType =
  | 'legacy_lifetime'
  | 'lifetime_purchase'
  | 'lifetime_upgrade'
  | 'subscription'
  | 'manual'

export type CheckoutStartResult =
  | { status: 'READY'; url: string }
  | { status: 'ACTIVE_CONFLICT' }
  | { status: 'ALREADY_OWNED' }
  | { status: 'NOT_ELIGIBLE' }
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
  stripeCustomerId: string
  snapshot: CheckoutSessionSnapshot
}

export type CheckoutResultStatus =
  | 'paid'
  | 'processing'
  | 'failed'
  | 'invalid'
  | 'unavailable'

export type CheckoutResult =
  | {
      status: Exclude<CheckoutResultStatus, 'invalid' | 'unavailable'>
      courseSlug: PaymentOffer['courseSlug']
      accessTier: PaymentOffer['accessTier']
    }
  | { status: 'invalid' | 'unavailable' }

export type CheckoutResultResolution = {
  currentUserId: string
  checkoutUserId: string
  paymentStatus: string
  sessionStatus: string | null
  orderStatus: CheckoutOrderStatus | null
}

export type SuccessSearchParams = Promise<{
  session_id?: string | string[]
}>

export type PaymentResultCardProps = {
  result: CheckoutResult
  retryHref: string
}

export type EnrollmentGrant = {
  courseSlug: string
  accessTier: string
  isActive: boolean
  enrolledAt: Date
  startsAt: Date | null
  expiresAt: Date | null
  revokedAt: Date | null
}

export type LifetimeUpgradeGrant = EnrollmentGrant & {
  sourceType: EntitlementSourceType | null
}

export type CoursePricingDetailsProps = {
  tierName: string
  price: string
  originalPrice?: string
  features: string[]
  isPremium: boolean
  badge?: string
}

export type CoursePricingCardProps = Omit<CoursePricingDetailsProps, 'isPremium'> & {
  offerKey: PaymentOfferKey
  isPremium?: boolean
  alreadyOwned?: boolean
  purchaseLabel?: string
}
