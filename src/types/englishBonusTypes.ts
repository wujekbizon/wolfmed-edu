import type { EnrollmentGrant, EntitlementSourceType } from '@/types/entitlementTypes'

export type EnglishBonusSource = EnrollmentGrant & {
  userId: string
  sourceId: string
}

export type EnglishBonusGrant = EnrollmentGrant & {
  userId: string
  courseSlug: 'angielski-medyczny'
  accessTier: 'basic'
  sourceType: 'premium_bundle'
  sourceId: string
}

export type EnglishBonusMigrationSource = Omit<EnglishBonusSource, 'sourceId' | 'sourceType'> & {
  id: string
  sourceId: string | null
  sourceType: EntitlementSourceType | null
}
