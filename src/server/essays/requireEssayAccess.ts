import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { getUserEnrollments } from '@/server/queries'
import { hasAccessToTier } from '@/helpers/accessTiers'
import { checkRateLimit } from '@/lib/rateLimit'

export async function requireEssayAccess(course?: string, bucket?: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Zaloguj się ponownie.')
  const enrollments = await getUserEnrollments(userId)
  if (!enrollments.length) throw new Error('Wymagany jest dostęp do kursu.')
  if (course && !enrollments.some((entry) => entry.courseSlug === course && hasAccessToTier(entry.accessTier, 'premium'))) {
    throw new Error('Generowanie pracy wymaga Premium dla wybranego kierunku.')
  }
  if (bucket && !(await checkRateLimit(userId, bucket)).success) {
    throw new Error('Osiągnięto limit żądań. Spróbuj ponownie później.')
  }
  return userId
}
