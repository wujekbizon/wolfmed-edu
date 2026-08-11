export type PaymentOfferKey =
  | 'opiekun_basic_lifetime'
  | 'opiekun_premium_lifetime'
  | 'pielegniarstwo_basic_lifetime'
  | 'pielegniarstwo_premium_lifetime'

export type PaymentOffer = {
  key: PaymentOfferKey
  courseSlug: 'opiekun-medyczny' | 'pielegniarstwo'
  accessTier: 'basic' | 'premium'
  amount: number
  currency: 'pln'
  available: boolean
  priceEnvName:
    | 'STRIPE_OPIEKUN_STANDARD_PRICE_ID'
    | 'STRIPE_OPIEKUN_PREMIUM_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_BASIC_PRICE_ID'
    | 'STRIPE_PIELEGNIARSTWO_PREMIUM_PRICE_ID'
}

export type CoursePricingDetailsProps = {
  tierName: string
  price: string
  features: string[]
  isPremium: boolean
  badge?: string
}

export type CoursePricingCardProps = Omit<CoursePricingDetailsProps, 'isPremium'> & {
  offerKey: PaymentOfferKey
  isPremium?: boolean
  alreadyOwned?: boolean
}
