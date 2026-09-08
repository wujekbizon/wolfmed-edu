import 'server-only'
import { getActiveFacts } from './stores/facts'
import { getRecentEpisodes } from './stores/episodes'
import { retrieveMemory } from './retrieve'
import { assembleMemoryContext } from '@/helpers/assembleMemoryContext'
import type { MemoryTailResult } from '@/types/memoryRetrievalTypes'

export async function buildMemoryTail(userId: string, query: string): Promise<MemoryTailResult> {
  try {
    const [factsExist, recentEpisodes] = await Promise.all([
      getActiveFacts(userId, 1), getRecentEpisodes(userId, { limit: 1 }),
    ])
    if (!factsExist.length && !recentEpisodes.length) return { text: '' }
    const memory = await retrieveMemory(userId, query)
    // Recent unrelated activity must not fill an explicit topic's recall.
    if (!memory.topics.length && !memory.episodes.length && recentEpisodes[0]) {
      const newest = recentEpisodes[0]
      memory.episodes.push({
        id: newest.episodeId, kind: 'episode', selectionReason: 'recent',
        content: newest.summary, score: 0, tier: 'low', recordedAt: newest.completedAt,
        topicKey: null, vectorScore: null, lexicalScore: null, normalizedLexicalScore: null,
      })
      memory.candidates.push({
        id: newest.episodeId, kind: 'episode', score: 0, topicKey: null,
        vectorScore: null, lexicalScore: null, normalizedLexicalScore: null,
        decision: 'selected',
      })
    }
    return assembleMemoryContext(memory)
  } catch (error) {
    console.error('[memory] buildMemoryTail failed:', error)
    return { text: '' }
  }
}
