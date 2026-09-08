import 'server-only'
import { sql } from 'drizzle-orm'
import { memFacts } from '@/server/db/memory-schema'
import { searchMemoryStore } from './searchMemoryStore'
import { getMemoryTopicExpression } from './getMemoryTopicExpression'
import type { MemorySearchInput } from '@/types/memoryRetrievalTypes'

export async function searchFactMemory(input: MemorySearchInput) {
  return searchMemoryStore({
    kind: 'fact', table: sql`${memFacts}`, id: sql`${memFacts.factId}`,
    content: sql`${memFacts.content}`, embedding: sql`${memFacts.embedding}`,
    recordedAt: sql`${memFacts.createdAt}`,
    topicKey: getMemoryTopicExpression(sql`${memFacts.metadata}`),
    scope: sql`${memFacts.userId} = ${input.userId} AND ${memFacts.status} = 'active'
      AND ${memFacts.supersededBy} IS NULL
      AND (${memFacts.expiresAt} IS NULL OR ${memFacts.expiresAt} > now())`,
  }, input)
}
