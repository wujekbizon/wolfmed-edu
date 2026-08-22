import type { CategoryDetails } from '@/types/categoryType'

export function countCategoryContent(details: CategoryDetails | undefined) {
  const program = details?.programContent
  const outcomes = details?.learningOutcomes

  return {
    topics:
      (program?.lectures.length ?? 0) +
      (program?.seminars.length ?? 0) +
      (program?.selfStudy.length ?? 0),
    outcomes:
      (outcomes?.knowledge.length ?? 0) +
      (outcomes?.skills.length ?? 0) +
      (outcomes?.competencies?.length ?? 0),
  }
}
