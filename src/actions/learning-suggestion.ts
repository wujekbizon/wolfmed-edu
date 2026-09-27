'use server'

import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeEvents, learningPracticeSessions } from '@/server/db/schema'
import { PracticeSuggestionInteractionSchema } from '@/server/schema'
import { requireCategoryAccess } from '@/server/learning/requireCategoryAccess'
import { isPracticeEnabled } from '@/server/learning/config'
import { getPracticeTelemetryView } from '@/helpers/getPracticeTelemetryView'
import { nextPracticeEventOrdinal } from '@/server/learning/nextEventOrdinal'
import { checkRateLimit } from '@/lib/rateLimit'
import { getPracticeItem } from '@/server/learning/getPracticeItems'

export async function recordPracticeSuggestionAction(input: unknown): Promise<void> {
  const parsed = PracticeSuggestionInteractionSchema.safeParse(input)
  if (!parsed.success) return
  const request = parsed.data
  try {
    const userId = await requireCategoryAccess(request.category)
    if (!isPracticeEnabled(request.category)) return
    if (!(await checkRateLimit(userId, 'practice:support')).success) return
    await db.transaction(async (tx) => {
      const [session] = await tx.select().from(learningPracticeSessions).where(and(
        eq(learningPracticeSessions.id, request.sessionId),
        eq(learningPracticeSessions.userId, userId),
        eq(learningPracticeSessions.category, request.category),
      )).for('update')
      if (!session || session.status !== 'active' || session.version !== request.version) return
      const item = (await getPracticeItem(tx, session, request.questionId))?.item
      if (!item || item.support?.mode !== 'active' ||
        item.support.trigger !== request.trigger || item.support.action !== request.action) return
      const type = request.interaction === 'accepted' ? 'support_accepted' : 'support_dismissed'
      const [existing] = await tx.select({ id: learningPracticeEvents.id }).from(learningPracticeEvents)
        .where(and(eq(learningPracticeEvents.sessionId, session.id),
          eq(learningPracticeEvents.questionId, item.id), eq(learningPracticeEvents.type, type),
          sql`${learningPracticeEvents.payload}->>'trigger' = ${request.trigger}`)).limit(1)
      if (existing) return
      await tx.insert(learningPracticeEvents).values({
        sessionId: session.id, eventId: request.eventId,
        ordinal: await nextPracticeEventOrdinal(tx, session.id),
        type, questionId: item.id, questionRevision: item.revision,
        payload: { trigger: request.trigger, action: request.action },
        response: getPracticeTelemetryView(session),
      })
    })
  } catch { return }
}
