import type {
  LifetimeUpgradeOfferKey,
  PaymentOffer,
  PaymentOfferKey,
} from '@/types/paymentTypes'
import { SUBSCRIPTION_PAYMENT_OFFERS } from '@/constants/subscriptionPaymentOffers'

export const PAYMENT_OFFER_KEYS = [
  'opiekun_basic_lifetime',
  'opiekun_premium_lifetime',
  'opiekun_premium_upgrade',
  'opiekun_basic_monthly',
  'opiekun_premium_monthly',
  'pielegniarstwo_basic_lifetime',
  'pielegniarstwo_premium_lifetime',
  'pielegniarstwo_premium_upgrade',
  'pielegniarstwo_basic_monthly',
  'pielegniarstwo_premium_monthly',
] as const satisfies readonly PaymentOfferKey[]

export const LIFETIME_UPGRADE_OFFER_BY_COURSE = {
  'opiekun-medyczny': 'opiekun_premium_upgrade',
  pielegniarstwo: 'pielegniarstwo_premium_upgrade',
} as const satisfies Record<PaymentOffer['courseSlug'], LifetimeUpgradeOfferKey>

export const PAYMENT_OFFERS: Record<PaymentOfferKey, PaymentOffer> = {
  opiekun_basic_lifetime: {
    key: 'opiekun_basic_lifetime',
    courseSlug: 'opiekun-medyczny',
    accessTier: 'basic',
    amount: 15999,
    currency: 'pln',
    available: true,
    purchaseModel: 'lifetime',
    entitlementSourceType: 'lifetime_purchase',
    priceEnvName: 'STRIPE_OPIEKUN_STANDARD_PRICE_ID',
  },
  opiekun_premium_lifetime: {
    key: 'opiekun_premium_lifetime',
    courseSlug: 'opiekun-medyczny',
    accessTier: 'premium',
    amount: 44999,
    currency: 'pln',
    available: true,
    purchaseModel: 'lifetime',
    entitlementSourceType: 'lifetime_purchase',
    priceEnvName: 'STRIPE_OPIEKUN_PREMIUM_PRICE_ID',
  },
  opiekun_premium_upgrade: {
    key: 'opiekun_premium_upgrade',
    courseSlug: 'opiekun-medyczny',
    accessTier: 'premium',
    amount: 29000,
    currency: 'pln',
    available: true,
    purchaseModel: 'lifetime',
    entitlementSourceType: 'lifetime_upgrade',
    priceEnvName: 'STRIPE_OPIEKUN_PREMIUM_UPGRADE_PRICE_ID',
  },
  pielegniarstwo_basic_lifetime: {
    key: 'pielegniarstwo_basic_lifetime',
    courseSlug: 'pielegniarstwo',
    accessTier: 'basic',
    amount: 27999,
    currency: 'pln',
    available: true,
    purchaseModel: 'lifetime',
    entitlementSourceType: 'lifetime_purchase',
    priceEnvName: 'STRIPE_PIELEGNIARSTWO_BASIC_PRICE_ID',
  },
  pielegniarstwo_premium_lifetime: {
    key: 'pielegniarstwo_premium_lifetime',
    courseSlug: 'pielegniarstwo',
    accessTier: 'premium',
    amount: 59999,
    currency: 'pln',
    available: true,
    purchaseModel: 'lifetime',
    entitlementSourceType: 'lifetime_purchase',
    priceEnvName: 'STRIPE_PIELEGNIARSTWO_PREMIUM_PRICE_ID',
  },
  pielegniarstwo_premium_upgrade: {
    key: 'pielegniarstwo_premium_upgrade',
    courseSlug: 'pielegniarstwo',
    accessTier: 'premium',
    amount: 32000,
    currency: 'pln',
    available: true,
    purchaseModel: 'lifetime',
    entitlementSourceType: 'lifetime_upgrade',
    priceEnvName: 'STRIPE_PIELEGNIARSTWO_PREMIUM_UPGRADE_PRICE_ID',
  },
  ...SUBSCRIPTION_PAYMENT_OFFERS,
}
