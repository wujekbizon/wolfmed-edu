import 'server-only'
import { embedQuery, EmbeddingUnavailable } from '@/server/embeddings'
import { searchFactMemory } from './searchFactMemory'
import { searchEpisodeMemory } from './searchEpisodeMemory'
import { getMemoryTopics } from './getMemoryTopics'
import { matchMemoryTopics } from '@/helpers/matchMemoryTopics'
import type { MemoryRecallResult, RetrieveMemoryOptions } from '@/types/memoryRetrievalTypes'

export async function retrieveMemory(
  userId: string, query: string, options: RetrieveMemoryOptions = {}
): Promise<MemoryRecallResult> {
  const topics = matchMemoryTopics(query, await getMemoryTopics(userId))
  const searchQuery = topics.length ? topics.map((topic) => topic.label).join(' ') : query
  let queryVector: number[] | null = null
  try {
    queryVector = await embedQuery(searchQuery)
  } catch (error) {
    if (!(error instanceof EmbeddingUnavailable)) throw error
  }
  const input = { userId, query: searchQuery, queryVector, topics }
  const [facts, episodes] = await Promise.all([
    searchFactMemory({ ...input, limit: options.factLimit ?? 8 }),
    searchEpisodeMemory({ ...input, limit: options.episodeLimit ?? 5 }),
  ])
  return {
    facts: facts.hits, episodes: episodes.hits, topics,
    candidates: [...facts.candidates, ...episodes.candidates],
    modes: { facts: facts.mode, episodes: episodes.mode },
  }
}
