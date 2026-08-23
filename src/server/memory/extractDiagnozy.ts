import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { diagnozy, diagnozyExamAttempts } from '@/server/db/schema'
import {
  MEMORY_PERFORMANCE_WINDOW,
  MEMORY_STRONG_PERCENT,
  MEMORY_WEAK_PERCENT,
} from '@/constants/memoryPerformance'
import { promoteFact } from './gate'
import { safeEmbedMemory } from './safeEmbedMemory'
import { insertEpisode } from './stores/episodes'
import type { DiagnozyMemoryEventInput } from '@/types/memoryTypes'
import { getMemoryPerformanceLabel } from '@/helpers/getMemoryPerformanceLabel'

export async function onDiagnozyExamCompleted(
  params: DiagnozyMemoryEventInput
): Promise<void> {
  const { userId, attemptId, diagnozaSlug, embed = true } = params
  try {
    const [attempts, diagnosis] = await Promise.all([
      db
        .select({
          id: diagnozyExamAttempts.id,
          score: diagnozyExamAttempts.score,
          passed: diagnozyExamAttempts.passed,
          completedAt: diagnozyExamAttempts.completedAt,
        })
        .from(diagnozyExamAttempts)
        .where(
          and(
            eq(diagnozyExamAttempts.userId, userId),
            eq(diagnozyExamAttempts.diagnozaSlug, diagnozaSlug)
          )
        )
        .orderBy(desc(diagnozyExamAttempts.completedAt))
        .limit(MEMORY_PERFORMANCE_WINDOW),
      db
        .select({ title: diagnozy.title })
        .from(diagnozy)
        .where(eq(diagnozy.slug, diagnozaSlug))
        .limit(1),
    ])
    if (attempts.length === 0) return

    const current = attempts.find((attempt) => attempt.id === attemptId) ?? attempts[0]!
    const average = Math.round(
      attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length
    )
    const level =
      average < MEMORY_WEAK_PERCENT
        ? 'weak'
        : average >= MEMORY_STRONG_PERCENT
          ? 'strong'
          : 'ok'
    const label = diagnosis[0]?.title ?? diagnozaSlug
    const date = current.completedAt.toISOString().slice(0, 10)
    const content = `Egzaminy diagnoz i interwencji „${label}”: ${getMemoryPerformanceLabel(average)} — średnio ${average}% w ${attempts.length} ostatnich podejściach (stan na ${date}).`

    await promoteFact({
      userId,
      subject: 'student',
      predicate: 'diagnozy_performance',
      content,
      source: 'quiz_derived',
      sourceRunId: `diagnozy:${attemptId}`,
      confidence: 1,
      factKey: `diagnozy:${diagnozaSlug}`,
      metadata: { diagnozaSlug, level, average, attempts: attempts.length },
      embedding: embed ? await safeEmbedMemory(content) : null,
    })

    const summary = `Ukończono egzamin diagnoz i interwencji „${label}” — wynik ${current.score}%, ${current.passed ? 'zaliczony' : 'niezaliczony'}.`
    await insertEpisode({
      userId,
      taskType: 'diagnozy_exam',
      title: `Diagnozy: ${label}`,
      summary,
      outcome: current.passed ? 'passed' : 'needs_work',
      sourceRunId: `diagnozy:${attemptId}`,
      artifacts: { attemptId, diagnozaSlug, score: current.score },
      embedding: embed ? await safeEmbedMemory(summary) : null,
    })
  } catch (error) {
    console.error('[memory] onDiagnozyExamCompleted failed:', error)
  }
}
