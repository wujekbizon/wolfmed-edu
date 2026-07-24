import { checkCourseAccessAction } from '@/actions/course-actions'
import { hasAccessToTier } from '@/helpers/accessTiers'

// Entitlement for Diagnozy i Interwencje: any active pielegniarstwo
// enrollment (basic tier is enough). Future AI features require premium.
export async function hasDiagnozyAccess(): Promise<boolean> {
  const { hasAccess, accessTier } = await checkCourseAccessAction('pielegniarstwo')
  return hasAccess && hasAccessToTier(accessTier ?? 'free', 'basic')
}
