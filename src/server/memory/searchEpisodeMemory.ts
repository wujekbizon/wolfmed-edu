import 'server-only'
import {
  and,
  cosineDistance,
  desc,
  eq,
  gt,
  isNotNull,
  or,
  sql,
} from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memEpisodes } from '@/server/db/memory-schema'
import { FUSED_SCORE_FLOOR, RETENTION } from './config'
import { fuseMemoryHits } from '@/helpers/fuseMemoryHits'
import { getMemoryQueryWords } from '@/helpers/getMemoryQueryWords'
import { getMemoryTier } from '@/helpers/getMemoryTier'
import type { MemorySearchResult, ScoredMemoryRow } from '@/types/memoryRetrievalTypes'

export async function searchEpisodeMemory(
  userId: string,
  query: string,
  queryVector: number[] | null,
  limit: number
): Promise<MemorySearchResult> {
  const cutoff = new Date(Date.now() - RETENTION.activeEpisodeDays * 24 * 60 * 60 * 1000)
  const scope = and(
    eq(memEpisodes.userId, userId),
    eq(memEpisodes.status, 'active'),
    gt(memEpisodes.completedAt, cutoff)
  )
  const similarity = sql<number>`similarity(${memEpisodes.summary}, ${query})`
  const lexicalPromise = db
    .select({ id: memEpisodes.episodeId, content: memEpisodes.summary, score: similarity })
    .from(memEpisodes)
    .where(and(scope, sql`similarity(${memEpisodes.summary}, ${query}) > 0.1`))
    .orderBy(desc(similarity))
    .limit(limit * 2)
    .then((rows): ScoredMemoryRow[] => rows.map((row) => ({ ...row, score: Number(row.score) })))

  if (queryVector) {
    const distance = cosineDistance(memEpisodes.embedding, queryVector)
    const vectorPromise = db
      .select({ id: memEpisodes.episodeId, content: memEpisodes.summary, distance })
      .from(memEpisodes)
      .where(and(scope, isNotNull(memEpisodes.embedding)))
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
        hits: hits.map((hit) => ({ ...hit, kind: 'episode', selectionReason: 'semantic' })),
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
        kind: 'episode' as const,
        selectionReason: 'semantic' as const,
      }))
    if (hits.length > 0) return { hits, mode: 'trgm-only' }
  }

  const words = getMemoryQueryWords(query)
  if (words.length === 0) return { hits: [], mode: 'ilike' }
  const rows = await db
    .select({ id: memEpisodes.episodeId, content: memEpisodes.summary })
    .from(memEpisodes)
    .where(and(scope, or(...words.map((word) => sql`${memEpisodes.summary} ILIKE ${`%${word}%`}`))))
    .limit(limit)
  return {
    hits: rows.map((row) => ({
      ...row,
      kind: 'episode',
      selectionReason: 'semantic',
      score: 0.45,
      tier: 'low',
    })),
    mode: 'ilike',
  }
}
