import 'server-only'
import { and, cosineDistance, desc, eq, isNotNull, or, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { libChunks } from '@/server/db/library-schema'
import { embedQuery, EmbeddingUnavailable } from '@/server/embeddings'
import { LIB_FUSION_WEIGHTS, LIB_SCORE_FLOOR, LIB_TOP_K, LIB_TRGM_FLOOR } from './config'
import type { LibrarySourceType } from './config'

export interface LibraryHit {
  chunkId: string
  content: string
  title: string
  sourceType: LibrarySourceType
  sourceId: string
  score: number
}

// Hard invariant, inherited from the memory layer: scope BEFORE rank. Every
// query filters to one student's rows before any ordering happens.
const scopeFor = (userId: string, sourceId?: string) =>
  sourceId
    ? and(eq(libChunks.userId, userId), eq(libChunks.sourceId, sourceId))
    : eq(libChunks.userId, userId)

const columns = {
  chunkId: libChunks.chunkId,
  content: libChunks.content,
  title: libChunks.title,
  sourceType: libChunks.sourceType,
  sourceId: libChunks.sourceId,
}

async function vectorSearch(userId: string, queryVec: number[], limit: number, sourceId?: string) {
  const distance = cosineDistance(libChunks.embedding, queryVec)
  const rows = await db
    .select({ ...columns, distance })
    .from(libChunks)
    .where(and(scopeFor(userId, sourceId), isNotNull(libChunks.embedding)))
    .orderBy(distance)
    .limit(limit)

  // Cosine distance ∈ [0,2] → similarity = 1 - distance.
  return rows.map((r) => ({ ...r, score: 1 - Number(r.distance) }))
}

// Catches the inflected forms Polish generates, and covers chunks the embedding
// sweep has not reached yet — which is why a just-saved note is findable at all.
//
// word_similarity, not similarity. similarity() is symmetric and normalised over
// both strings' trigram sets, so a 40-character question against a
// 900-character chunk tops out near 40/900 ≈ 0.04 even when every trigram of the
// question is present — below any useful threshold. That is not a tuning
// problem; it makes the whole lexical tier unreachable for chunk-sized text.
//
// word_similarity(query, content) instead measures the question against the best
// matching extent of the chunk, which is the actual question being asked. The
// memory layer keeps similarity() correctly: its facts are single sentences,
// comparable in length to a query.
async function trgmSearch(userId: string, query: string, limit: number, sourceId?: string) {
  const sim = sql<number>`word_similarity(${query}, ${libChunks.content})`
  const rows = await db
    .select({ ...columns, sim })
    .from(libChunks)
    .where(
      and(
        scopeFor(userId, sourceId),
        sql`word_similarity(${query}, ${libChunks.content}) > ${LIB_TRGM_FLOOR}`
      )
    )
    .orderBy(desc(sim))
    .limit(limit)

  return rows.map((r) => ({ ...r, score: Number(r.sim) }))
}

// Last resort when both signals come back empty: the term is literally present
// but trigram similarity across a 1000-character chunk is too diluted to score.
async function ilikeSearch(userId: string, query: string, limit: number, sourceId?: string) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 6)
  if (words.length === 0) return []

  const rows = await db
    .select(columns)
    .from(libChunks)
    .where(
      and(
        scopeFor(userId, sourceId),
        or(...words.map((w) => sql`${libChunks.content} ILIKE ${'%' + w + '%'}`))
      )
    )
    .limit(limit)

  // Deliberately below the note floor and above the material floor: a literal
  // substring match is weak evidence, good enough for a document but not enough
  // to promote a note over curriculum.
  return rows.map((r) => ({ ...r, score: 0.45 }))
}

type Scored = { chunkId: string; content: string; title: string; sourceType: string; sourceId: string; score: number }

function fuse(vec: Scored[], lex: Scored[], topK: number): LibraryHit[] {
  const merged = new Map<string, { row: Scored; vec?: number; lex?: number }>()
  for (const v of vec) merged.set(v.chunkId, { row: v, vec: v.score })
  for (const l of lex) {
    const existing = merged.get(l.chunkId)
    if (existing) existing.lex = l.score
    else merged.set(l.chunkId, { row: l, lex: l.score })
  }

  return [...merged.values()]
    .map(({ row, vec: v, lex: l }) => ({
      chunkId: row.chunkId,
      content: row.content,
      title: row.title,
      sourceType: row.sourceType as LibrarySourceType,
      sourceId: row.sourceId,
      score:
        v != null && l != null
          ? LIB_FUSION_WEIGHTS.vector * v + LIB_FUSION_WEIGHTS.lexical * l
          : (v ?? l ?? 0),
    }))
    .filter((h) => h.score >= LIB_SCORE_FLOOR[h.sourceType])
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

/**
 * Searches one student's notes and materials.
 *
 * Cascades hybrid → lexical-only → ILIKE, exactly as the memory layer does, so a
 * slow or failed embedding degrades the ranking instead of failing the request.
 * `sourceId` narrows to a single attached note or material.
 */
export async function retrieveLibrary(
  userId: string,
  query: string,
  options: { topK?: number; sourceId?: string } = {}
): Promise<LibraryHit[]> {
  const topK = options.topK ?? LIB_TOP_K
  const { sourceId } = options
  if (!query.trim()) return []

  // Every path exits through fuse(), which is where the source-specific floor
  // lives. Returning a tier's rows directly would let a note in at the material
  // threshold.
  const lastResort = async () => fuse([], await ilikeSearch(userId, query, topK, sourceId), topK)

  try {
    const queryVec = await embedQuery(query)
    const [vec, lex] = await Promise.all([
      vectorSearch(userId, queryVec, topK * 2, sourceId),
      trgmSearch(userId, query, topK * 2, sourceId),
    ])
    const hits = fuse(vec, lex, topK)
    return hits.length > 0 ? hits : lastResort()
  } catch (error) {
    if (!(error instanceof EmbeddingUnavailable)) throw error
    const hits = fuse([], await trgmSearch(userId, query, topK, sourceId), topK)
    return hits.length > 0 ? hits : lastResort()
  }
}
