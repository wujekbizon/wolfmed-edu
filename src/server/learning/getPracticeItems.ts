import 'server-only'
import { and, eq } from 'drizzle-orm'
import { learningPracticeItems } from '@/server/db/schema'
import type { PracticeSession, PracticeTransaction } from '@/types/learningPracticeServerTypes'
import type { PracticeItem } from '@/types/learningPracticeTypes'

export async function getPracticeItemRows(tx: PracticeTransaction, sessionId: string) {
  return tx.select().from(learningPracticeItems)
    .where(eq(learningPracticeItems.sessionId, sessionId))
}

export async function getPracticeItems(tx: PracticeTransaction, session: PracticeSession): Promise<PracticeItem[]> {
  const rows = await getPracticeItemRows(tx, session.id)
  const saved = new Map(rows.map((row) => [row.questionId, row.item]))
  return session.items.map((item) => saved.get(item.id) ?? item)
}

export async function getPracticeItem(tx: PracticeTransaction, session: PracticeSession, questionId?: string) {
  const position = questionId
    ? session.items.findIndex((item) => item.id === questionId)
    : session.activeIndex
  const base = session.items[position]
  if (!base) return null
  const [saved] = await tx.select({ item: learningPracticeItems.item })
    .from(learningPracticeItems)
    .where(and(eq(learningPracticeItems.sessionId, session.id),
      eq(learningPracticeItems.questionId, base.id)))
    .limit(1)
  return { item: saved?.item ?? base, position }
}
