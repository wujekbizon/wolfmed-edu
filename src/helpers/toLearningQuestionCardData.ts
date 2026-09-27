import 'server-only'
import { getPracticeRevision } from '@/helpers/getPracticeRevision'
import type { Test } from '@/types/dataTypes'
import type { LearningQuestionCardData } from '@/types/learningPracticeTypes'
import { LearningQuestionCardDataSchema } from '@/server/schema'

export function toLearningQuestionCardData(tests: Test[]): LearningQuestionCardData[] {
  return tests.flatMap((test) => {
    const card = LearningQuestionCardDataSchema.safeParse(test.data)
    if (!card.success) return []
    return [{
      id: test.id, revision: getPracticeRevision(card.data), question: card.data.question,
      options: card.data.answers.map((answer) => answer.option),
      practiceable: card.data.answers.filter((answer) => answer.isCorrect).length === 1,
    }]
  })
}
