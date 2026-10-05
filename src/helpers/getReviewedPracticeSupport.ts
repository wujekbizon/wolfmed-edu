import 'server-only'
import { PRACTICE_CATALOG_VERSION } from '@/constants/learningPractice'
import { ReviewedPracticeSupportSchema } from '@/server/schema'
import { reviewedPracticeSupport } from '@/server/learning/supportCatalog'

export function getReviewedPracticeSupport(questionId: string, revision: string, catalogVersion: string) {
  if (catalogVersion !== PRACTICE_CATALOG_VERSION) return null
  const entry = reviewedPracticeSupport.find((support) => support.questionId === questionId && support.revision === revision)
  const parsed = ReviewedPracticeSupportSchema.safeParse(entry)
  return parsed.success ? parsed.data : null
}
