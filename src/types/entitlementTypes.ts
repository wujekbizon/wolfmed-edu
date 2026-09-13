export type EntitlementSourceType =
  | 'legacy_lifetime'
  | 'lifetime_purchase'
  | 'lifetime_upgrade'
  | 'subscription'
  | 'manual'
  | 'premium_bundle'

export type EnrollmentGrant = {
  courseSlug: string
  accessTier: string
  sourceType?: EntitlementSourceType | null
  isActive: boolean
  enrolledAt: Date
  startsAt: Date | null
  expiresAt: Date | null
  revokedAt: Date | null
}

export type LifetimeUpgradeGrant = EnrollmentGrant & {
  sourceType: EntitlementSourceType | null
}
