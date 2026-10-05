'use server'

import { after } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { PracticeHelpInteractionSchema } from '@/server/schema'
import { requireCategoryAccess } from '@/server/learning/requireCategoryAccess'
import { isPracticeEnabled } from '@/server/learning/config'
import { getPracticeItem } from '@/server/learning/getPracticeItems'
import { nextPracticeEventOrdinal } from '@/server/learning/nextEventOrdinal'
import { getPracticeTelemetryView } from '@/helpers/getPracticeTelemetryView'
import { checkRateLimit } from '@/lib/rateLimit'
import { db } from '@/server/db/index'
import { learningPracticeEvents, learningPracticeSessions } from '@/server/db/schema'
import { onPracticeActivity } from '@/server/memory/extractPractice'

export async function recordPracticeHelpInteractionAction(input: unknown): Promise<void> {
  const parsed = PracticeHelpInteractionSchema.safeParse(input)
  if (!parsed.success) return
  const request = parsed.data
  try {
    const userId = await requireCategoryAccess(request.category)
    if (!isPracticeEnabled(request.category) || !(await checkRateLimit(userId, 'practice:write')).success) return
    const saved = await db.transaction(async (tx) => {
      const [session] = await tx.select().from(learningPracticeSessions).where(and(
        eq(learningPracticeSessions.id, request.sessionId), eq(learningPracticeSessions.userId, userId),
        eq(learningPracticeSessions.category, request.category),
      )).for('update')
      if (!session || session.status !== 'active' || session.version !== request.version) return false
      const [existing] = await tx.select({ id: learningPracticeEvents.id }).from(learningPracticeEvents)
        .where(and(eq(learningPracticeEvents.sessionId, session.id), eq(learningPracticeEvents.eventId, request.eventId)))
        .limit(1)
      if (existing) return false
      const current = await getPracticeItem(tx, session, request.questionId)
      if (!current) return false
      await tx.insert(learningPracticeEvents).values({
        sessionId: session.id, eventId: request.eventId,
        ordinal: await nextPracticeEventOrdinal(tx, session.id), type: 'comparison_opened',
        questionId: request.questionId,
        questionRevision: current.item.revision,
        payload: { action: request.action }, response: getPracticeTelemetryView(session),
      })
      return true
    })
    if (saved) after(async () => { await onPracticeActivity(userId, request.category) })
  } catch { return }
}
