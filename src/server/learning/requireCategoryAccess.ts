import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { hasAccessToTier } from '@/helpers/accessTiers'
import { getUserEnrollments } from '@/server/queries'
import { PracticeError } from './PracticeError'

export async function requireCategoryAccess(category: string) {
  const { userId } = await auth()
  if (!userId) throw new PracticeError('Zaloguj się ponownie.')
  const metadata = CATEGORY_METADATA[category]
  if (!metadata?.course) throw new PracticeError('Kategoria jest niedostępna.')
  const enrollment = (await getUserEnrollments(userId))
    .find((entry) => entry.courseSlug === metadata.course)
  if (!enrollment || !hasAccessToTier(enrollment.accessTier, metadata.requiredTier)) {
    throw new PracticeError('Brak dostępu do tej kategorii.')
  }
  return userId
}
