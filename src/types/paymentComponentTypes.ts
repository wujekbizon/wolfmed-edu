import type { CheckoutResult } from '@/types/paymentResultTypes'
import type {
  LifetimeUpgradeOfferKey,
  PaymentOffer,
  PaymentOfferKey,
} from '@/types/paymentOfferTypes'
import type { SubscriptionPlanChange } from '@/types/subscriptionTypes'

export type PricingOfferStatus =
  | 'available'
  | 'current_subscription'
  | 'portal_upgrade'
  | 'downgrade_available'
  | 'scheduled_downgrade'
  | 'portal_upgrade_unavailable'
  | 'active_subscription'
  | 'owned_lifetime'
  | 'lifetime_access'
  | 'existing_access'
  | 'unavailable'

export type PricingOfferStatusMap = Partial<
  Record<PaymentOfferKey, PricingOfferStatus>
>

export type PaymentResultCardProps = {
  result: CheckoutResult
  retryHref: string
}

export type PaymentResultContent = {
  title: string
  description: string
  symbol: string
  tone: string
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
  offerStatus: PricingOfferStatus
  purchaseLabel?: string
  subscriptionPlanChange?: SubscriptionPlanChange | null
}

export type CourseHeroActionProps = {
  courseSlug: PaymentOffer['courseSlug']
  offerStatuses: PricingOfferStatusMap
  eligibleLifetimeUpgradeOfferKey: LifetimeUpgradeOfferKey | null
}
