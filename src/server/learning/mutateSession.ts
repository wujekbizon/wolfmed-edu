import 'server-only'
import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeEvents, learningPracticeSessions } from '@/server/db/schema'
import { transitionPractice } from '@/helpers/transitionPractice'
import { loadPracticeQuestion } from './loadQuestion'
import { buildPracticeView } from './buildView'
import { getPracticeItem } from './getPracticeItems'
import { savePracticeItem } from './savePracticeItem'
import type { PracticeActionInput } from '@/types/learningPracticeTypes'
import { PRACTICE_EVENT_TYPES } from '@/constants/learningPractice'
import { nextPracticeEventOrdinal } from './nextEventOrdinal'

export async function mutatePracticeSession(userId: string, category: string, input: PracticeActionInput) {
  return db.transaction(async (tx) => {
    const [session] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, input.sessionId), eq(learningPracticeSessions.userId, userId),
      eq(learningPracticeSessions.category, category),
    )).for('update')
    if (!session) throw new Error('Sesja niedostępna.')
    const [existing] = await tx.select({ response: learningPracticeEvents.response })
      .from(learningPracticeEvents).where(and(
        eq(learningPracticeEvents.sessionId, session.id), eq(learningPracticeEvents.eventId, input.eventId),
      )).limit(1)
    if (existing) return existing.response
    if (session.version !== input.version || session.status !== 'active') {
      return buildPracticeView(tx, session)
    }
    const current = await getPracticeItem(tx, session, input.questionId)
    if (!current) throw new Error('Pytanie niedostępne.')
    const { item, position } = current
    const previousOutcome = item.outcome
    const question = await loadPracticeQuestion(tx, item.id, category)
    transitionPractice(item, input, question && question.revision === item.revision ? question.data : null)
    if (previousOutcome !== item.outcome) {
      if (previousOutcome) session.summary[previousOutcome]--
      if (item.outcome) session.summary[item.outcome]++
    }
    session.activeIndex = input.command === 'next' || input.command === 'skip'
      ? position + 1 : position
    const resolvedCount = Object.values(session.summary).reduce((sum, value) => sum + value, 0)
    const completed = session.activeIndex >= session.items.length ||
      (input.command === 'finish' && resolvedCount >= session.items.length)
    if (completed || input.command === 'finish') {
      session.status = completed ? 'completed' : 'abandoned'
      session.finishedAt = new Date()
    }
    session.version++
    item.version = session.version
    await savePracticeItem(tx, session.id, position, item)
    await tx.update(learningPracticeSessions).set({
      activeIndex: session.activeIndex, summary: session.summary, status: session.status,
      finishedAt: session.finishedAt, version: session.version,
    }).where(eq(learningPracticeSessions.id, session.id))
    const response = await buildPracticeView(tx, session, item.id, true, input.eventId)
    const ordinal = await nextPracticeEventOrdinal(tx, session.id)
    await tx.insert(learningPracticeEvents).values({
      sessionId: session.id, eventId: input.eventId, ordinal,
      type: PRACTICE_EVENT_TYPES[input.command], questionId: item.id, questionRevision: item.revision,
      payload: { selected: input.selected ?? null, attempts: item.attempts.length,
        correct: input.command === 'answer' ? item.attempts.at(-1)?.correct ?? null : null,
        assisted: input.command === 'answer' ? item.attempts.at(-1)?.assisted ?? false : false,
        outcome: item.outcome, hintOpened: item.hintOpened, revealed: item.revealed, status: session.status },
      response,
    })
    if (session.status !== 'active') await tx.insert(learningPracticeEvents).values({
      sessionId: session.id, eventId: randomUUID(), ordinal: ordinal + 1,
      type: session.status === 'completed' ? 'session_completed' : 'session_abandoned',
      payload: { summary: response.summary }, response,
    })
    return response
  })
}
