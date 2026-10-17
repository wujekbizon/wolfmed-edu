import 'server-only'

import type { Test } from '@/types/dataTypes'
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
  if (category.startsWith(CUSTOM_PREFIX)) {
    const customCategory = await getUserCustomCategoryById(
      userId,
      category.slice(CUSTOM_PREFIX.length)
    )
    if (!customCategory) return []
    const tests = (await getUserCustomTestsByIds(questionIds)) as Test[]
    return selectPracticeSessionTests(tests, questionIds, sessionId)
  }
  const tests = (await getTestsByCategory(category)) as Test[]
  return selectPracticeSessionTests(tests, questionIds, sessionId)
}
