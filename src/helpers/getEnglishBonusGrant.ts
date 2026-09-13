import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import type { EnglishBonusGrant, EnglishBonusSource } from '@/types/englishBonusTypes'

export function getEnglishBonusGrant(
  source: EnglishBonusSource,
  now = new Date()
): EnglishBonusGrant | null {
  if (
    !['opiekun-medyczny', 'pielegniarstwo'].includes(source.courseSlug) ||
    !source.sourceType || source.sourceType === 'premium_bundle'
  ) return null

  const isActive = source.accessTier === 'premium' &&
    getEffectiveEnrollmentGrants([source], now).length > 0

  return {
    userId: source.userId,
    courseSlug: 'angielski-medyczny',
    accessTier: 'basic',
    sourceType: 'premium_bundle',
    sourceId: `${source.sourceType}:${source.sourceId}`,
    isActive,
    enrolledAt: source.enrolledAt,
    startsAt: source.sourceType === 'subscription' ? null : source.startsAt,
    expiresAt: source.expiresAt,
    revokedAt: isActive ? null : now,
  }
}
