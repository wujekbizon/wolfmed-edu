import 'server-only'
import { getPracticeItems } from './getPracticeItems'
import { loadPracticeQuestion } from './loadQuestion'
import type { PracticeSession, PracticeTransaction } from '@/types/learningPracticeServerTypes'

export async function hasPracticeReviewCard(tx: PracticeTransaction, session: PracticeSession, currentId: string) {
  const items = await getPracticeItems(tx, session)
  for (const item of items) {
    if (item.id === currentId || item.outcome !== 'revealed') continue
    const question = await loadPracticeQuestion(tx, item.id, session.category)
    if (question?.revision === item.revision) return true
  }
  return false
}
