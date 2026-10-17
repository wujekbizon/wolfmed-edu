import 'server-only'
import { randomUUID } from 'node:crypto'
import { after } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeEvents, learningPracticeSessions } from '@/server/db/schema'
import { startPracticeSession } from '@/server/learning/startSession'
import { getPracticeItem } from '@/server/learning/getPracticeItems'
import { savePracticeItem } from '@/server/learning/savePracticeItem'
import { buildPracticeView } from '@/server/learning/buildView'
import { nextPracticeEventOrdinal } from '@/server/learning/nextEventOrdinal'
import { onPracticeActivity } from '@/server/memory/extractPractice'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import type { WolfekPracticeReference } from '@/types/wolfekResponseTypes'
import type { WolfekLearningMode } from '@/types/wolfekLearningTypes'

export async function recordWolfekLearningAssistance(userId: string, ref: WolfekPracticeReference, eventId: string, mode: WolfekLearningMode) {
  const started = ref.sessionId ? null : await startPracticeSession(userId, ref.category, randomUUID())
  const view = await db.transaction(async (tx) => {
    const [session] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, ref.sessionId ?? started!.id), eq(learningPracticeSessions.userId, userId),
      eq(learningPracticeSessions.category, ref.category),
    )).for('update')
    if (!session || session.status !== 'active' || session.version !== (started?.version ?? ref.version)) {
      throw new WolfekQuestionError('Postęp uległ zmianie. Poproś o pomoc ponownie.')
    }
    const current = await getPracticeItem(tx, session, ref.questionId)
    if (!current || current.item.revision !== ref.revision) throw new WolfekQuestionError('Pytanie uległo zmianie.')
    if (!current.item.outcome && mode !== 'explain') current.item.hintOpened = true
    session.version++
    current.item.version = session.version
    await savePracticeItem(tx, session.id, current.position, current.item)
    await tx.update(learningPracticeSessions).set({ version: session.version })
      .where(eq(learningPracticeSessions.id, session.id))
    const response = await buildPracticeView(tx, session, ref.questionId, true)
    await tx.insert(learningPracticeEvents).values({ sessionId: session.id, eventId,
      ordinal: await nextPracticeEventOrdinal(tx, session.id), questionId: ref.questionId, questionRevision: ref.revision,
      type: mode === 'hint' ? 'hint_opened' : mode === 'compare' ? 'comparison_opened' : 'tutor_answered',
      payload: { mode, selected: ref.selected ?? null, assisted: mode !== 'explain' }, response })
    return response
  })
  after(async () => { await onPracticeActivity(userId, ref.category) })
  return view
}
