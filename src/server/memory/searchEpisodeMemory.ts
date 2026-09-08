import 'server-only'
import { sql } from 'drizzle-orm'
import { memEpisodes } from '@/server/db/memory-schema'
import { searchMemoryStore } from './searchMemoryStore'
import { getMemoryTopicExpression } from './getMemoryTopicExpression'
import { RETENTION } from './config'
import type { MemorySearchInput } from '@/types/memoryRetrievalTypes'

export async function searchEpisodeMemory(input: MemorySearchInput) {
  const cutoff = new Date(Date.now() - RETENTION.activeEpisodeDays * 86400000)
  return searchMemoryStore({
    kind: 'episode', table: sql`${memEpisodes}`, id: sql`${memEpisodes.episodeId}`,
    content: sql`${memEpisodes.summary}`, embedding: sql`${memEpisodes.embedding}`,
    recordedAt: sql`${memEpisodes.completedAt}`,
    topicKey: getMemoryTopicExpression(sql`${memEpisodes.artifacts}`),
    scope: sql`${memEpisodes.userId} = ${input.userId} AND ${memEpisodes.status} = 'active'
      AND ${memEpisodes.completedAt} > ${cutoff}`,
  }, input)
}
