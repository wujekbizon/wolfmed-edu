import 'server-only'
import { embedQuery, EmbeddingUnavailable } from '@/server/embeddings'
import { searchFactMemory } from './searchFactMemory'
import { searchEpisodeMemory } from './searchEpisodeMemory'
import type { MemoryRecallResult } from '@/types/memoryRetrievalTypes'

interface RetrieveMemoryOptions {
  factLimit?: number
  episodeLimit?: number
}

export async function retrieveMemory(
  userId: string,
  query: string,
  options: RetrieveMemoryOptions = {}
): Promise<MemoryRecallResult> {
  let queryVector: number[] | null = null
  try {
    queryVector = await embedQuery(query)
  } catch (error) {
    if (!(error instanceof EmbeddingUnavailable)) throw error
  }

  const [facts, episodes] = await Promise.all([
    searchFactMemory(userId, query, queryVector, options.factLimit ?? 8),
    searchEpisodeMemory(userId, query, queryVector, options.episodeLimit ?? 5),
  ])

  return {
    facts: facts.hits,
    episodes: episodes.hits,
    modes: { facts: facts.mode, episodes: episodes.mode },
  }
}
