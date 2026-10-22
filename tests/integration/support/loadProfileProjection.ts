import { and, desc, eq, gte, inArray, isNull, sql } from 'drizzle-orm'
import { learningPracticeEvents, learningPracticeSessions } from '@/server/db/schema'
import { memFacts } from '@/server/db/memory-schema'
import { summarizePracticeObservations } from '@/helpers/summarizePracticeObservations'
import { toDateKey } from '@/server/planner/engine'
import { extractSource, loadSource } from '../../support/loadSource'
import { createProjectionDatabase } from './profileProjectionDatabase'
import { projectionKey } from './profileProjectionFixture'
import type { FactCandidate, NewMemoryEpisode } from '@/types/memoryTypes'
import type { ProfileProjectionState } from './profileProjectionTypes'
import type { PracticeObservationSummary } from '@/types/learningObservationTypes'
import type { ProfileProjectionUpdate } from '@/types/practiceProfileTypes'
import { coalesceProfileProjection } from '@/helpers/coalesceProfileProjection'

export function loadProfileProjection(state: ProfileProjectionState, coalesced = false) {
  const db = createProjectionDatabase(state)
  const { getPracticeObservations } = loadSource<{
    getPracticeObservations: (user: string, category: string, tx: unknown) => Promise<PracticeObservationSummary>
  }>(extractSource(new URL('../../../src/server/learning/getPracticeObservations.ts', import.meta.url),
    'getPracticeObservations'), { db, and, desc, eq, gte, inArray, learningPracticeEvents,
    learningPracticeSessions, summarizePracticeObservations })
  const { projectPracticeActivity } = loadSource<{ projectPracticeActivity: ProfileProjectionUpdate }>(
    extractSource(new URL('../../../src/server/memory/projectPracticeActivity.ts', import.meta.url), 'projectPracticeActivity'),
    { db, and, eq, isNull, sql, memFacts, getPracticeObservations, toDateKey,
      promoteFact: async (fact: FactCandidate) => {
        state.metrics.factWrites++
        const category = String(fact.metadata?.category)
        state.facts.set(projectionKey(fact.userId, category), structuredClone(fact))
      },
      insertEpisode: async (episode: NewMemoryEpisode) => {
        state.metrics.episodeWrites++
        state.episodes.set(`${episode.userId}:${episode.sourceRunId}`, structuredClone(episode))
      },
    })
  if (!coalesced) return projectPracticeActivity
  return loadSource<{ onPracticeActivity: ProfileProjectionUpdate }>(
    extractSource(new URL('../../../src/server/memory/extractPractice.ts', import.meta.url), 'onPracticeActivity'),
    { coalesceProfileProjection, projectPracticeActivity }).onPracticeActivity
}
