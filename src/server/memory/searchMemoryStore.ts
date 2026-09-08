import 'server-only'
import { fuseMemoryHits } from '@/helpers/fuseMemoryHits'
import { FUSED_SCORE_FLOOR } from './config'
import { searchMemoryCandidates } from './searchMemoryCandidates'
import type { MemorySearchInput, MemorySearchSource, MemorySearchResult, MemoryHit } from '@/types/memoryRetrievalTypes'

export async function searchMemoryStore(
  source: MemorySearchSource, input: MemorySearchInput
): Promise<MemorySearchResult> {
  const { vectorRows, lexicalRows, topicRows, literal, failed } = await searchMemoryCandidates(source, input)
  const ranked = fuseMemoryHits(vectorRows, lexicalRows)
  const merged = new Map<string, MemoryHit>(ranked.map((row) => [
    row.id, { ...row, kind: source.kind, selectionReason: input.topics.length ? 'topic' : 'semantic' },
  ]))
  if (literal) {
    for (const hit of merged.values()) {
      if (hit.lexicalScore !== 0.5) continue
      hit.score = 0.5
      hit.tier = 'standard'
      hit.lexicalScore = null
      hit.normalizedLexicalScore = null
      hit.selectionReason = 'literal'
    }
  }
  for (const row of topicRows) {
    const existing = merged.get(row.id)
    merged.set(row.id, {
      ...row, vectorScore: null, lexicalScore: null, normalizedLexicalScore: null,
      ...existing, kind: source.kind, score: 1, tier: 'high', selectionReason: 'topic',
    })
  }
  const candidates = [...merged.values()].sort((a, b) =>
    (input.topics.length ? b.recordedAt.getTime() - a.recordedAt.getTime() : b.score - a.score) ||
    a.id.localeCompare(b.id))
  const hits = candidates.filter((hit) =>
    hit.selectionReason === 'topic' || hit.score >= FUSED_SCORE_FLOOR).slice(0, input.limit)
  const selected = new Set(hits.map((hit) => hit.id))
  return {
    hits,
    candidates: candidates.map((hit) => ({
      id: hit.id, kind: hit.kind, score: hit.score, vectorScore: hit.vectorScore,
      lexicalScore: hit.lexicalScore, normalizedLexicalScore: hit.normalizedLexicalScore,
      topicKey: hit.topicKey,
      decision: selected.has(hit.id) ? 'selected' :
        hit.score < FUSED_SCORE_FLOOR ? 'below_threshold' : 'limit',
    })),
    mode: topicRows.length && !vectorRows.length && !lexicalRows.length ? 'topic-exact' :
      literal ? 'ilike' : vectorRows.length && lexicalRows.length ? 'hybrid' :
      vectorRows.length ? 'vector-only' : lexicalRows.length || topicRows.length ? 'trgm-only' :
        failed ? 'unavailable' : 'ilike',
  }
}
