import 'server-only'
import {
  and,
  cosineDistance,
  desc,
  eq,
  gt,
  isNotNull,
  isNull,
  or,
  sql,
} from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memFacts } from '@/server/db/memory-schema'
import { FUSED_SCORE_FLOOR } from './config'
import { fuseMemoryHits } from '@/helpers/fuseMemoryHits'
import { getMemoryQueryWords } from '@/helpers/getMemoryQueryWords'
import { getMemoryTier } from '@/helpers/getMemoryTier'
import type { MemorySearchResult, ScoredMemoryRow } from '@/types/memoryRetrievalTypes'

export async function searchFactMemory(
  userId: string,
  query: string,
  queryVector: number[] | null,
  limit: number
): Promise<MemorySearchResult> {
  const scope = and(
    eq(memFacts.userId, userId),
    eq(memFacts.status, 'active'),
    isNull(memFacts.supersededBy),
    or(isNull(memFacts.expiresAt), gt(memFacts.expiresAt, new Date()))
  )
  const similarity = sql<number>`similarity(${memFacts.content}, ${query})`
  const lexicalPromise = db
    .select({ id: memFacts.factId, content: memFacts.content, score: similarity })
    .from(memFacts)
    .where(and(scope, sql`similarity(${memFacts.content}, ${query}) > 0.1`))
    .orderBy(desc(similarity))
    .limit(limit * 2)
    .then((rows): ScoredMemoryRow[] => rows.map((row) => ({ ...row, score: Number(row.score) })))

  if (queryVector) {
    const distance = cosineDistance(memFacts.embedding, queryVector)
    const vectorPromise = db
      .select({ id: memFacts.factId, content: memFacts.content, distance })
      .from(memFacts)
      .where(and(scope, isNotNull(memFacts.embedding)))
      .orderBy(distance)
      .limit(limit * 2)
      .then((rows) => rows.map((row) => ({
        id: row.id,
        content: row.content,
        score: 1 - Number(row.distance),
      })))
    const [vector, lexical] = await Promise.all([vectorPromise, lexicalPromise])
    const hits = fuseMemoryHits(vector, lexical, limit)
    if (hits.length > 0) {
      const mode = lexical.length === 0 ? 'vector-only' : vector.length === 0 ? 'trgm-only' : 'hybrid'
      return {
        hits: hits.map((hit) => ({ ...hit, kind: 'fact', selectionReason: 'semantic' })),
        mode,
      }
    }
  } else {
    const lexical = await lexicalPromise
    const hits = lexical
      .filter((hit) => hit.score >= FUSED_SCORE_FLOOR)
      .slice(0, limit)
      .map((hit) => ({
        ...hit,
        tier: getMemoryTier(hit.score),
        kind: 'fact' as const,
        selectionReason: 'semantic' as const,
      }))
    if (hits.length > 0) return { hits, mode: 'trgm-only' }
  }

  const words = getMemoryQueryWords(query)
  if (words.length === 0) return { hits: [], mode: 'ilike' }
  const rows = await db
    .select({ id: memFacts.factId, content: memFacts.content })
    .from(memFacts)
    .where(and(scope, or(...words.map((word) => sql`${memFacts.content} ILIKE ${`%${word}%`}`))))
    .limit(limit)
  return {
    hits: rows.map((row) => ({
      ...row,
      kind: 'fact',
      selectionReason: 'semantic',
      score: 0.45,
      tier: 'low',
    })),
    mode: 'ilike',
  }
}
