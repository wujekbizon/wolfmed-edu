import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import type { PjmBonusGrant, PjmBonusSource } from '@/types/pjmBonusTypes'

const PARENT_COURSES = ['opiekun-medyczny', 'pielegniarstwo']

export function getPjmBonusGrant(
  source: PjmBonusSource,
  now = new Date()
): PjmBonusGrant | null {
  if (
    !PARENT_COURSES.includes(source.courseSlug) ||
    !source.sourceType ||
    source.sourceType === 'premium_bundle' ||
    !['basic', 'premium'].includes(source.accessTier)
  ) return null

  const isActive = getEffectiveEnrollmentGrants([source], now).length > 0

  return {
    userId: source.userId,
    courseSlug: 'jezyk-migowy',
    accessTier: 'basic',
    sourceType: 'premium_bundle',
    sourceId: `jezyk-migowy:${source.sourceType}:${source.sourceId}`,
    isActive,
    enrolledAt: source.enrolledAt,
    startsAt: source.sourceType === 'subscription' ? null : source.startsAt,
    expiresAt: source.expiresAt,
    revokedAt: isActive ? null : now,
  }
}
