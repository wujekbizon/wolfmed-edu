import type { PaymentOffer } from '@/types/paymentTypes'

export const MONTHLY_OFFER_BY_COURSE_TIER = {
  'opiekun-medyczny': {
    basic: 'opiekun_basic_monthly',
    premium: 'opiekun_premium_monthly',
  },
  pielegniarstwo: {
    basic: 'pielegniarstwo_basic_monthly',
    premium: 'pielegniarstwo_premium_monthly',
  },
} as const satisfies Record<
  PaymentOffer['courseSlug'],
  Record<PaymentOffer['accessTier'], PaymentOffer['key']>
>
