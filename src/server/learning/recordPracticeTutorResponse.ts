import 'server-only'
import { randomUUID } from 'node:crypto'
import { after } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getPracticeTelemetryView } from '@/helpers/getPracticeTelemetryView'
import { db } from '@/server/db/index'
import { learningPracticeEvents, learningPracticeSessions } from '@/server/db/schema'
import type { PracticeReference } from '@/types/learningPracticeTypes'
import { getPracticeItem } from './getPracticeItems'
import { nextPracticeEventOrdinal } from './nextEventOrdinal'
import { requireCategoryAccess } from './requireCategoryAccess'
import { isPracticeEnabled } from './config'
import { onPracticeActivity } from '@/server/memory/extractPractice'

export async function recordPracticeTutorResponse(userId: string, reference: PracticeReference): Promise<void> {
  const [owned] = await db.select({ category: learningPracticeSessions.category })
    .from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, reference.sessionId), eq(learningPracticeSessions.userId, userId),
    )).limit(1)
  if (!owned || !isPracticeEnabled(owned.category)) return
  await requireCategoryAccess(owned.category)
  const saved = await db.transaction(async (tx) => {
    const [session] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, reference.sessionId), eq(learningPracticeSessions.userId, userId),
    )).for('update')
    if (!session || session.category !== owned.category) return null
    const current = await getPracticeItem(tx, session, reference.questionId)
    if (!current || current.item.revision !== reference.questionRevision) return null
    const attempt = reference.attemptId
      ? current.item.attempts.find((entry) => entry.eventId === reference.attemptId) : null
    if (reference.attemptId && !attempt) return null
    if (!current.item.revealed && !current.item.attempts.some((entry) => entry.correct)) return null
    await tx.insert(learningPracticeEvents).values({
      sessionId: session.id, eventId: randomUUID(), ordinal: await nextPracticeEventOrdinal(tx, session.id),
      type: 'tutor_answered', questionId: current.item.id, questionRevision: current.item.revision,
      payload: { purpose: reference.purpose, attemptId: reference.attemptId },
      response: getPracticeTelemetryView(session),
    })
    return session.category
  })
  if (saved) after(async () => { await onPracticeActivity(userId, saved) })
}
