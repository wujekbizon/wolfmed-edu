import 'server-only'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memFacts } from '@/server/db/memory-schema'
import { getPracticeObservations } from '@/server/learning/getPracticeObservations'
import { toDateKey } from '@/server/planner/engine'
import { promoteFact } from './gate'
import { insertEpisode } from './stores/episodes'

export async function onPracticeActivity(userId: string, category: string): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      const projectionKey = `${userId}:practice-projection:${category}`
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${projectionKey}))`)
      const summary = await getPracticeObservations(userId, category, tx)
      if (!summary.lastEventId || !summary.lastAt) return
      const [latest] = await tx.select({ metadata: memFacts.metadata }).from(memFacts)
        .where(and(eq(memFacts.userId, userId), eq(memFacts.status, 'active'),
          isNull(memFacts.supersededBy), sql`${memFacts.metadata}->>'key' = ${`practice:${category}`}`)).limit(1)
      if (latest?.metadata && (latest.metadata as Record<string, unknown>).lastEventId === summary.lastEventId) return
      const date = new Date(summary.lastAt)
      const day = toDateKey(date)
      const content = `Centrum Nauki, kategoria "${category}", w ostatnich maksymalnie 120 zapisanych zdarzeniach: ${summary.cards} kart; ${summary.firstCorrect} pierwszych odpowiedzi samodzielnie poprawnych; ${summary.firstWrong} pierwszych błędnych; ${summary.retries} ponowień, ${summary.hints} wskazówek, ${summary.comparisons} porównań, ${summary.tutorResponses} odpowiedzi asystenta i ${summary.reveals} ujawnień (ostatnie zdarzenie ${summary.lastAt}).`
      await promoteFact({ userId, subject: 'student', predicate: 'practice_activity',
        source: 'practice_derived', sourceRunId: `practice:${summary.lastEventId}`,
        factKey: `practice:${category}`, confidence: 1, content, embedding: null,
        metadata: { category, ...summary } }, tx)
      await insertEpisode({ userId, taskType: 'learning_practice',
        title: `Centrum Nauki: ${category}`,
        summary: `Nauka w kategorii "${category}" — nowa aktywność; w ostatnich maksymalnie 120 zdarzeniach ${summary.cards} kart i ${summary.hints} wskazówek.`,
        outcome: 'activity', sourceRunId: `practice:${category}:${day}`, completedAt: date,
        artifacts: { category, lastEventId: summary.lastEventId, day,
          cards: summary.cards, firstCorrect: summary.firstCorrect, firstWrong: summary.firstWrong,
          retries: summary.retries, hints: summary.hints, comparisons: summary.comparisons,
          tutorResponses: summary.tutorResponses, reveals: summary.reveals } }, tx)
    })
    return true
  } catch (error) {
    console.error('[memory] onPracticeActivity failed:', error)
    return false
  }
}
