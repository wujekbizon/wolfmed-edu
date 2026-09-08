import 'server-only'
import { sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memFacts, memEpisodes } from '@/server/db/memory-schema'
import { RETENTION } from './config'
import { getMemoryTopicExpression } from './getMemoryTopicExpression'
import type { MemoryTopic } from '@/types/memoryRetrievalTypes'

export async function getMemoryTopics(userId: string): Promise<MemoryTopic[]> {
  const factKey = getMemoryTopicExpression(sql`${memFacts.metadata}`)
  const episodeKey = getMemoryTopicExpression(sql`${memEpisodes.artifacts}`)
  const cutoff = new Date(Date.now() - RETENTION.activeEpisodeDays * 86400000)
  const result = await db.execute<MemoryTopic>(sql`
    SELECT DISTINCT key, label FROM (
      SELECT ${factKey} AS key,
        coalesce(substring(${memFacts.content} from '["„]([^"”]+)["”]'),
          ${memFacts.metadata}->>'category', ${memFacts.metadata}->>'diagnozaSlug') AS label
      FROM ${memFacts}
      WHERE ${memFacts.userId} = ${userId} AND ${memFacts.status} = 'active'
        AND ${memFacts.supersededBy} IS NULL
        AND (${memFacts.expiresAt} IS NULL OR ${memFacts.expiresAt} > now())
      UNION
      SELECT ${episodeKey} AS key,
        coalesce(CASE WHEN ${memEpisodes.artifacts}->>'procedureId' IS NOT NULL
          OR ${memEpisodes.artifacts}->>'diagnozaSlug' IS NOT NULL
          THEN regexp_replace(${memEpisodes.title}, '^[^:]+: *', '') END,
          substring(${memEpisodes.summary} from '["„]([^"”]+)["”]'),
          ${memEpisodes.artifacts}->>'category',
          ${memEpisodes.artifacts}->>'categoryKey',
          ${memEpisodes.title}) AS label
      FROM ${memEpisodes}
      WHERE ${memEpisodes.userId} = ${userId} AND ${memEpisodes.status} = 'active'
        AND ${memEpisodes.completedAt} > ${cutoff}
    ) topics WHERE key IS NOT NULL AND label IS NOT NULL
  `)
  return result.rows
}
