import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { challengeCompletions } from '@/server/db/schema'
import { promoteFact } from './gate'
import { safeEmbedMemory } from './safeEmbedMemory'
import { insertEpisode } from './stores/episodes'
import type { ChallengeMemoryEventInput } from '@/types/memoryTypes'
import { getMemoryPerformanceLabel } from '@/helpers/getMemoryPerformanceLabel'
import { getChallengeTypeLabel } from '@/helpers/getChallengeTypeLabel'

export async function onChallengeCompleted(
  params: ChallengeMemoryEventInput
): Promise<void> {
  const { userId, embed = true } = params
  try {
    const completions = await db
      .select({
        score: challengeCompletions.score,
        passed: challengeCompletions.passed,
        attempts: challengeCompletions.attempts,
      })
      .from(challengeCompletions)
      .where(
        and(
          eq(challengeCompletions.userId, userId),
          eq(challengeCompletions.procedureId, params.procedureId)
        )
      )

    const average = completions.length
      ? Math.round(
          completions.reduce((sum, completion) => sum + completion.score, 0) /
            completions.length
        )
      : params.currentScore
    const passed = completions.filter((completion) => completion.passed).length
    const content = `Wyzwania procedury „${params.procedureName}”: ${getMemoryPerformanceLabel(average)} — średnio ${average}%, zaliczone ${passed} z ${completions.length} typów.`
    const sourceRunId = `challenge:${params.completionId}:${params.attempts}`

    await promoteFact({
      userId,
      subject: 'student',
      predicate: 'procedure_performance',
      content,
      source: 'quiz_derived',
      sourceRunId,
      confidence: 1,
      factKey: `procedure:${params.procedureId}`,
      metadata: { procedureId: params.procedureId, average, passed },
      embedding: embed ? await safeEmbedMemory(content) : null,
    })

    const summary = `Ukończono wyzwanie „${getChallengeTypeLabel(params.challengeType)}” procedury „${params.procedureName}” — wynik ${params.currentScore}%.`
    await insertEpisode({
      userId,
      taskType: 'procedure_challenge',
      title: `Procedura: ${params.procedureName}`,
      summary,
      outcome: params.currentScore >= 70 ? 'passed' : 'needs_work',
      sourceRunId,
      artifacts: {
        completionId: params.completionId,
        procedureId: params.procedureId,
        challengeType: params.challengeType,
        score: params.currentScore,
      },
      embedding: embed ? await safeEmbedMemory(summary) : null,
    })
  } catch (error) {
    console.error('[memory] onChallengeCompleted failed:', error)
  }
}
