import 'server-only'
import { desc, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memFacts } from '@/server/db/memory-schema'
import { getMemoryTopicExpression } from './getMemoryTopicExpression'
import type { MemoryHit } from '@/types/memoryRetrievalTypes'

export async function getMemoryOverview(userId: string): Promise<MemoryHit[]> {
  const rows = await db.select({
    id: memFacts.factId, content: memFacts.content, recordedAt: memFacts.createdAt,
    topicKey: getMemoryTopicExpression(sql`${memFacts.metadata}`),
  }).from(memFacts).where(sql`
    ${memFacts.userId} = ${userId} AND ${memFacts.status} = 'active'
    AND ${memFacts.supersededBy} IS NULL
    AND (${memFacts.expiresAt} IS NULL OR ${memFacts.expiresAt} > now())
  `).orderBy(desc(memFacts.createdAt), memFacts.factId).limit(40)
  return rows.map((row) => ({
    ...row, kind: 'fact', selectionReason: 'overview', score: 1, tier: 'standard',
    vectorScore: null, lexicalScore: null, normalizedLexicalScore: null,
  }))
}
