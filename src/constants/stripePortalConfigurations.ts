import type { PaymentOffer } from '@/types/paymentTypes'

export const STRIPE_PORTAL_CONFIGURATION_ENV_BY_COURSE = {
  'opiekun-medyczny': 'STRIPE_OPIEKUN_PORTAL_CONFIGURATION_ID',
  pielegniarstwo: 'STRIPE_PIELEGNIARSTWO_PORTAL_CONFIGURATION_ID',
  'angielski-medyczny': 'STRIPE_ANGIELSKI_MEDYCZNY_PORTAL_CONFIGURATION_ID',
  'jezyk-migowy': 'STRIPE_JEZYK_MIGOWY_PORTAL_CONFIGURATION_ID',
} as const satisfies Record<PaymentOffer['courseSlug'], string>
