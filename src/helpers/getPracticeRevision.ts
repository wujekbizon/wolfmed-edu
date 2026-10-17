import 'server-only'
import { createHash } from 'node:crypto'
import type { TestData } from '@/types/dataTypes'

export function getPracticeRevision(data: TestData): string {
  return createHash('sha256').update(JSON.stringify({
    question: data.question,
    answers: data.answers.map(({ option, isCorrect }) => ({ option, isCorrect })),
  })).digest('hex')
}
