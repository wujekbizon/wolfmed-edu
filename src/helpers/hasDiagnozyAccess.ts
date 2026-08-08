import { checkCourseAccessAction } from '@/actions/course-actions'
import { hasAccessToTier } from '@/helpers/accessTiers'

// Entitlement for Diagnozy i Interwencje: an active pielegniarstwo enrollment
// on the premium tier.
export async function hasDiagnozyAccess(): Promise<boolean> {
  const { hasAccess, accessTier } = await checkCourseAccessAction('pielegniarstwo')
  return hasAccess && hasAccessToTier(accessTier ?? 'free', 'premium')
}
