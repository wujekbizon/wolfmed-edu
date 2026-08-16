import type { CheckoutOrderStatus } from '@/types/checkoutTypes'
import type { PaymentOffer } from '@/types/paymentOfferTypes'

export type CheckoutResultStatus =
  | 'paid'
  | 'scheduled'
  | 'processing'
  | 'failed'
  | 'invalid'
  | 'unavailable'

export type PaymentResultOutcome =
  | 'lifetime_purchase'
  | 'subscription_purchase'
  | 'lifetime_upgrade'
  | 'subscription_upgrade'
  | 'subscription_downgrade'

export type CheckoutResult =
  | {
      status: 'scheduled'
      courseSlug: PaymentOffer['courseSlug']
      accessTier: PaymentOffer['accessTier']
      outcome: 'subscription_downgrade'
      effectiveAt: Date
    }
  | {
      status: Exclude<CheckoutResultStatus, 'invalid' | 'unavailable' | 'scheduled'>
      courseSlug: PaymentOffer['courseSlug']
      accessTier: PaymentOffer['accessTier']
      outcome: PaymentResultOutcome
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
  subscription_id?: string | string[]
}>
