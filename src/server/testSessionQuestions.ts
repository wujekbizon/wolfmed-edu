import 'server-only'

import type { Test } from '@/types/dataTypes'
import { hasPracticeCategoryAccess } from '@/server/hasPracticeCategoryAccess'
import { getPracticeQuestionsByIds } from '@/server/practiceQuestionQueries'
import { selectPracticeSessionTests, selectSessionTests } from '@/helpers/selectSessionTests'
import {
  getTestsByCategory,
  getUserCustomCategoryById,
  getUserCustomTestsByIds,
} from '@/server/queries'

const CUSTOM_PREFIX = 'moje-testy__'

async function getTestsForCategory(userId: string, category: string) {
  if (category.startsWith(CUSTOM_PREFIX)) {
    const customCategory = await getUserCustomCategoryById(
      userId,
      category.slice(CUSTOM_PREFIX.length)
    )
    if (!customCategory) return []
    return (await getUserCustomTestsByIds(customCategory.questionIds)) as Test[]
  }
  return (await getTestsByCategory(category)) as Test[]
}

export async function getSessionQuestions(
  userId: string,
  category: string,
  count: number,
  sessionId: string
) {
  const tests = await getTestsForCategory(userId, category)
  return selectSessionTests(tests, count, sessionId)
}

export async function getPracticeSessionQuestions(
  userId: string,
  category: string,
  questionIds: string[],
  sessionId: string
) {
  if (!(await hasPracticeCategoryAccess(userId, category))) return []
  const tests = await getPracticeQuestionsByIds(userId, category, questionIds)
  return selectPracticeSessionTests(tests, questionIds, sessionId)
}
