import 'server-only'

import type { Test } from '@/types/dataTypes'
import { selectSessionTests } from '@/helpers/selectSessionTests'
import {
  getTestsByCategory,
  getUserCustomCategoryById,
  getUserCustomTestsByIds,
} from '@/server/queries'

const CUSTOM_PREFIX = 'moje-testy__'

export async function getSessionQuestions(
  userId: string,
  category: string,
  count: number,
  sessionId: string
) {
  let tests: Test[]

  if (category.startsWith(CUSTOM_PREFIX)) {
    const customCategory = await getUserCustomCategoryById(
      userId,
      category.slice(CUSTOM_PREFIX.length)
    )
    if (!customCategory) return []
    tests = (await getUserCustomTestsByIds(customCategory.questionIds)) as Test[]
  } else {
    tests = (await getTestsByCategory(category)) as Test[]
  }

  return selectSessionTests(tests, count, sessionId)
}
