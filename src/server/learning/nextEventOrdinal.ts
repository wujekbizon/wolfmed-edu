import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { learningPracticeEvents } from '@/server/db/schema'
import type { PracticeTransaction } from '@/types/learningPracticeServerTypes'

export async function nextPracticeEventOrdinal(tx: PracticeTransaction, sessionId: string) {
  const [event] = await tx.select({ ordinal: learningPracticeEvents.ordinal }).from(learningPracticeEvents)
    .where(eq(learningPracticeEvents.sessionId, sessionId)).orderBy(desc(learningPracticeEvents.ordinal)).limit(1)
  return (event?.ordinal ?? 0) + 1
}
