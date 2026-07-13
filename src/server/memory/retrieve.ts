import 'server-only'
import { and, cosineDistance, desc, eq, isNull, isNotNull, or, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memFacts } from '@/server/db/memory-schema'
import { embedQuery, EmbeddingUnavailable } from './embeddings'
import {
  FUSION_WEIGHTS,
  FUSED_SCORE_FLOOR,
  TIER_THRESHOLDS,
  type RetrievalTier,
} from './config'

export interface MemoryHit {
  factId: string
  content: string
  score: number
  tier: RetrievalTier
}

export interface FactRetrievalResult {
  hits: MemoryHit[]
  // Which cascade tier actually served the results — recorded, never surfaced as
  // an error to the student.
  mode: 'hybrid' | 'trgm-only' | 'ilike'
}

// Hard invariant: scope BEFORE rank. Every query filters the student's own
// active, non-superseded facts before any ordering.
const scopeFor = (userId: string) =>
  and(eq(memFacts.userId, userId), eq(memFacts.status, 'active'), isNull(memFacts.supersededBy))

function tierOf(score: number): RetrievalTier {
  if (score >= TIER_THRESHOLDS.high) return 'high'
  if (score >= TIER_THRESHOLDS.standard) return 'standard'
  return 'low'
}

async function vectorSearch(userId: string, queryVec: number[], limit: number) {
  const distance = cosineDistance(memFacts.embedding, queryVec)
  const rows = await db
    .select({ factId: memFacts.factId, content: memFacts.content, distance })
    .from(memFacts)
    .where(and(scopeFor(userId), isNotNull(memFacts.embedding)))
    .orderBy(distance)
    .limit(limit)
  // Cosine distance ∈ [0,2] → cosine similarity = 1 - distance.
  return rows.map((r) => ({ factId: r.factId, content: r.content, score: 1 - Number(r.distance) }))
}

async function trgmSearch(userId: string, query: string, limit: number) {
  const sim = sql<number>`similarity(${memFacts.content}, ${query})`
  const rows = await db
    .select({ factId: memFacts.factId, content: memFacts.content, sim })
    .from(memFacts)
    .where(and(scopeFor(userId), sql`similarity(${memFacts.content}, ${query}) > 0.1`))
    .orderBy(desc(sim))
    .limit(limit)
  return rows.map((r) => ({ factId: r.factId, content: r.content, score: Number(r.sim) }))
}

// Last resort when both signals come back empty: substring match on the query's
// significant words. Language-agnostic, handles the case where trgm similarity is
// below threshold but the term is literally present.
async function ilikeSearch(userId: string, query: string, limit: number): Promise<MemoryHit[]> {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 6)
  if (words.length === 0) return []

  const rows = await db
    .select({ factId: memFacts.factId, content: memFacts.content })
    .from(memFacts)
    .where(and(scopeFor(userId), or(...words.map((w) => sql`${memFacts.content} ILIKE ${'%' + w + '%'}`))))
    .limit(limit)
  // Fixed modest score — these are literal-match fallbacks, tiered 'low'.
  return rows.map((r) => ({ factId: r.factId, content: r.content, score: 0.45, tier: tierOf(0.45) }))
}

function fuse(
  vec: Array<{ factId: string; content: string; score: number }>,
  lex: Array<{ factId: string; content: string; score: number }>,
  topK: number
): MemoryHit[] {
  const merged = new Map<string, { content: string; vec?: number; lex?: number }>()
  for (const v of vec) merged.set(v.factId, { content: v.content, vec: v.score })
  for (const l of lex) {
    const existing = merged.get(l.factId)
    if (existing) existing.lex = l.score
    else merged.set(l.factId, { content: l.content, lex: l.score })
  }

  return [...merged.entries()]
    .map(([factId, e]) => {
      const score =
        e.vec != null && e.lex != null
          ? FUSION_WEIGHTS.vector * e.vec + FUSION_WEIGHTS.lexical * e.lex
          : (e.vec ?? e.lex ?? 0)
      return { factId, content: e.content, score, tier: tierOf(score) }
    })
    .filter((h) => h.score >= FUSED_SCORE_FLOOR)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

// Cascade: hybrid (vector + trgm) → trgm-only (embed unavailable) → ILIKE (both
// empty). Degradation is recorded in `mode`, never raised as an error.
export async function retrieveFacts(
  userId: string,
  query: string,
  topK = 8
): Promise<FactRetrievalResult> {
  try {
    const queryVec = await embedQuery(query)
    const [vec, lex] = await Promise.all([
      vectorSearch(userId, queryVec, topK * 2),
      trgmSearch(userId, query, topK * 2),
    ])
    const hits = fuse(vec, lex, topK)
    if (hits.length > 0) return { hits, mode: 'hybrid' }
    return { hits: await ilikeSearch(userId, query, topK), mode: 'ilike' }
  } catch (error) {
    if (!(error instanceof EmbeddingUnavailable)) throw error
    // Embed call failed — the lexical tier is the load-bearing fallback.
    const lex = await trgmSearch(userId, query, topK)
    const hits = lex.filter((h) => h.score >= FUSED_SCORE_FLOOR).map((h) => ({ ...h, tier: tierOf(h.score) }))
    if (hits.length > 0) return { hits, mode: 'trgm-only' }
    return { hits: await ilikeSearch(userId, query, topK), mode: 'ilike' }
  }
}
