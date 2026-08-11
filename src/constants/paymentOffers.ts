import type { PaymentOffer, PaymentOfferKey } from '@/types/paymentTypes'

export const PAYMENT_OFFER_KEYS = [
  'opiekun_basic_lifetime',
  'opiekun_premium_lifetime',
  'pielegniarstwo_basic_lifetime',
  'pielegniarstwo_premium_lifetime',
] as const satisfies readonly PaymentOfferKey[]

export const PAYMENT_OFFERS: Record<PaymentOfferKey, PaymentOffer> = {
  opiekun_basic_lifetime: {
    key: 'opiekun_basic_lifetime',
    courseSlug: 'opiekun-medyczny',
    accessTier: 'basic',
    amount: 15999,
    currency: 'pln',
    available: true,
    priceEnvName: 'STRIPE_OPIEKUN_STANDARD_PRICE_ID',
  },
  opiekun_premium_lifetime: {
    key: 'opiekun_premium_lifetime',
    courseSlug: 'opiekun-medyczny',
    accessTier: 'premium',
    amount: 44999,
    currency: 'pln',
    available: true,
    priceEnvName: 'STRIPE_OPIEKUN_PREMIUM_PRICE_ID',
  },
  pielegniarstwo_basic_lifetime: {
    key: 'pielegniarstwo_basic_lifetime',
    courseSlug: 'pielegniarstwo',
    accessTier: 'basic',
    amount: 27999,
    currency: 'pln',
    available: true,
    priceEnvName: 'STRIPE_PIELEGNIARSTWO_BASIC_PRICE_ID',
  },
  pielegniarstwo_premium_lifetime: {
    key: 'pielegniarstwo_premium_lifetime',
    courseSlug: 'pielegniarstwo',
    accessTier: 'premium',
    amount: 59999,
    currency: 'pln',
    available: true,
    priceEnvName: 'STRIPE_PIELEGNIARSTWO_PREMIUM_PRICE_ID',
  },
}
