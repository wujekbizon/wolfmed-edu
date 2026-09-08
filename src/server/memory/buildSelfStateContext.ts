import 'server-only'
import { getPreferencesMap } from './stores/preferences'
import { retrieveMemory } from './retrieve'
import { getMemoryOverview } from './getMemoryOverview'
import { renderMemoryPreferences } from '@/helpers/renderMemoryPreferences'
import { assembleMemoryContext } from '@/helpers/assembleMemoryContext'
import { isMemoryOverviewQuery } from '@/helpers/isMemoryOverviewQuery'
import type { SelfStateContextResult } from '@/types/memoryTypes'

export async function buildSelfStateContext(
  userId: string, query: string
): Promise<SelfStateContextResult> {
  try {
    const [memory, preferences] = await Promise.all([
      retrieveMemory(userId, query, { factLimit: 20, episodeLimit: 8 }),
      getPreferencesMap(userId),
    ])
    if (!memory.topics.length && isMemoryOverviewQuery(query)) {
      memory.facts = await getMemoryOverview(userId)
      const ids = new Set(memory.facts.map((hit) => hit.id))
      memory.candidates = memory.candidates.filter((row) => row.kind !== 'fact' || !ids.has(row.id))
      memory.candidates.push(...memory.facts.map((hit) => ({
        id: hit.id, kind: hit.kind, score: hit.score, topicKey: hit.topicKey,
        vectorScore: null, lexicalScore: null, normalizedLexicalScore: null,
        decision: 'selected' as const,
      })))
    }
    if (!memory.facts.length && !memory.episodes.length) {
      return { status: Object.values(memory.modes).includes('unavailable') ? 'unavailable' : 'empty' }
    }
    const preferenceLines = renderMemoryPreferences(preferences)
    const assembled = assembleMemoryContext(memory, preferenceLines)
    return {
      status: 'ready', context: assembled.text, recall: assembled.recall,
      counts: {
        facts: assembled.recall.facts.length,
        preferences: preferenceLines.length,
        episodes: assembled.recall.episodes.length,
      },
    }
  } catch (error) {
    console.error('[memory] buildSelfStateContext failed:', error)
    return { status: 'unavailable' }
  }
}
