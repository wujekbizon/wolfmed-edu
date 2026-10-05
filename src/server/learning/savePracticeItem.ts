import 'server-only'
import { learningPracticeItems } from '@/server/db/schema'
import type { PracticeTransaction } from '@/types/learningPracticeServerTypes'
import type { PracticeItem } from '@/types/learningPracticeTypes'

export async function savePracticeItem(tx: PracticeTransaction, sessionId: string,
  position: number, item: PracticeItem) {
  await tx.insert(learningPracticeItems).values({
    sessionId, questionId: item.id, position, item, updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [learningPracticeItems.sessionId, learningPracticeItems.questionId],
    set: { position, item, updatedAt: new Date() },
  })
}

