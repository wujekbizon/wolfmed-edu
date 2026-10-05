import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeEvents, learningPracticeItems, learningPracticeSessions, users } from '@/server/db/schema'
import { clearPracticeItem } from '@/helpers/clearPracticeItem'
import { getPracticeTelemetryView } from '@/helpers/getPracticeTelemetryView'
import { buildPracticeView } from './buildView'
import { getPracticeItems } from './getPracticeItems'
import { nextPracticeEventOrdinal } from './nextEventOrdinal'
import { PracticeError } from './PracticeError'
import type { PracticeResetInput } from '@/types/learningPracticeTypes'

export async function resetPracticeSession(userId: string, input: PracticeResetInput) {
  return db.transaction(async (tx) => {
    await tx.select({ id: users.id }).from(users).where(eq(users.userId, userId)).for('update')
    const [session] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, input.sessionId), eq(learningPracticeSessions.userId, userId),
      eq(learningPracticeSessions.category, input.category),
    )).for('update')
    if (!session) throw new PracticeError('Postęp nauki jest niedostępny.')
    const [existing] = await tx.select({ id: learningPracticeEvents.id })
      .from(learningPracticeEvents).where(and(
        eq(learningPracticeEvents.sessionId, session.id), eq(learningPracticeEvents.eventId, input.eventId),
      )).limit(1)
    if (existing) return buildPracticeView(tx, session)
    if (session.version !== input.version) throw new PracticeError('Postęp uległ zmianie. Odśwież widok i spróbuj ponownie.')
    const previous = await getPracticeItems(tx, session)
    session.items = previous.map(clearPracticeItem)
    session.activeIndex = 0
    session.version++
    session.summary = { unassisted: 0, assisted: 0, revealed: 0, skipped: 0, invalid: 0 }
    session.status = 'active'
    session.finishedAt = null
    await tx.delete(learningPracticeItems).where(eq(learningPracticeItems.sessionId, session.id))
    await tx.update(learningPracticeSessions).set({
      items: session.items, activeIndex: 0, version: session.version,
      status: 'active', finishedAt: null, summary: session.summary,
    }).where(eq(learningPracticeSessions.id, session.id))
    const response = await buildPracticeView(tx, session)
    await tx.insert(learningPracticeEvents).values({
      sessionId: session.id, eventId: input.eventId,
      ordinal: await nextPracticeEventOrdinal(tx, session.id),
      type: 'progress_reset', questionId: null, questionRevision: null,
      payload: { clearedCards: previous.length, priorExposurePreserved: true },
      response: getPracticeTelemetryView(session),
    })
    return response
  })
}

