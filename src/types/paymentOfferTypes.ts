export type CheckoutPurchaseModel = 'lifetime' | 'subscription'

export type PaymentOfferKey =
  | 'opiekun_basic_lifetime'
  | 'opiekun_premium_lifetime'
  | 'opiekun_premium_upgrade'
  | 'opiekun_basic_monthly'
  | 'opiekun_premium_monthly'
  | 'pielegniarstwo_basic_lifetime'
  | 'pielegniarstwo_premium_lifetime'
  | 'pielegniarstwo_premium_upgrade'
  | 'pielegniarstwo_basic_monthly'
  | 'pielegniarstwo_premium_monthly'

export type LifetimeUpgradeOfferKey =
  | 'opiekun_premium_upgrade'
  | 'pielegniarstwo_premium_upgrade'

export type SubscriptionPaymentOfferKey =
  | 'opiekun_basic_monthly'
  | 'opiekun_premium_monthly'
  | 'pielegniarstwo_basic_monthly'
  | 'pielegniarstwo_premium_monthly'

export type PaymentOffer = {
  key: PaymentOfferKey
  courseSlug: 'opiekun-medyczny' | 'pielegniarstwo'
  accessTier: 'basic' | 'premium'
  amount: number
  currency: 'pln'
  available: boolean
  purchaseModel: CheckoutPurchaseModel
  entitlementSourceType: 'lifetime_purchase' | 'lifetime_upgrade' | 'subscription'
  priceEnvName:
    | 'STRIPE_OPIEKUN_STANDARD_PRICE_ID'
    | 'STRIPE_OPIEKUN_PREMIUM_PRICE_ID'
    | 'STRIPE_OPIEKUN_PREMIUM_UPGRADE_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_BASIC_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_PREMIUM_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_PREMIUM_UPGRADE_PRICE_ID'
    | 'STRIPE_OPIEKUN_BASIC_MONTHLY_PRICE_ID'
    | 'STRIPE_OPIEKUN_PREMIUM_MONTHLY_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_BASIC_MONTHLY_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_PREMIUM_MONTHLY_PRICE_ID'
}

export type VerifiedPaymentOffer = PaymentOffer & {
  priceId: string
  productId: string
  taxBehavior: 'exclusive' | 'inclusive' | 'unspecified' | null
}
