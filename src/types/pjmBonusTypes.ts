import type { EnrollmentGrant } from '@/types/entitlementTypes'

export type PjmBonusSource = EnrollmentGrant & {
  userId: string
  sourceId: string
}

export type PjmBonusGrant = EnrollmentGrant & {
  userId: string
  courseSlug: 'jezyk-migowy'
  accessTier: 'basic'
  sourceType: 'premium_bundle'
  sourceId: string
}
