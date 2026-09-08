import type { RetrievalTier } from '@/server/memory/config'
import type { SQL } from 'drizzle-orm'

export type MemoryRetrievalMode = 'hybrid' | 'vector-only' | 'trgm-only' | 'ilike' | 'topic-exact' | 'unavailable'
export type MemoryTopic = { key: string; label: string }
export type ScoredMemoryRow = {
  id: string
  content: string
  score: number
  recordedAt: Date
  topicKey: string | null
}
export interface RankedMemoryRow extends ScoredMemoryRow {
  tier: RetrievalTier
  vectorScore: number | null
  lexicalScore: number | null
  normalizedLexicalScore: number | null
}
export interface MemoryHit extends RankedMemoryRow {
  kind: 'fact' | 'episode'
  selectionReason: 'semantic' | 'topic' | 'recent' | 'overview' | 'literal'
}
export interface MemoryCandidateTrace {
  id: string
  kind: 'fact' | 'episode'
  score: number
  vectorScore: number | null
  lexicalScore: number | null
  normalizedLexicalScore: number | null
  topicKey: string | null
  decision: 'selected' | 'below_threshold' | 'limit' | 'budget' | 'diversity'
}
export interface MemorySearchResult {
  hits: MemoryHit[]
  candidates: MemoryCandidateTrace[]
  mode: MemoryRetrievalMode
}
export interface MemoryRecallResult {
  facts: MemoryHit[]
  episodes: MemoryHit[]
  topics: MemoryTopic[]
  candidates: MemoryCandidateTrace[]
  modes: { facts: MemoryRetrievalMode; episodes: MemoryRetrievalMode }
}
export interface MemoryRecallTrace {
  facts: Array<Pick<MemoryHit, 'id' | 'score' | 'tier' | 'selectionReason' | 'recordedAt' | 'topicKey'>>
  episodes: MemoryRecallTrace['facts']
  modes: MemoryRecallResult['modes']
  topics: MemoryTopic[]
  candidates: MemoryCandidateTrace[]
}
export interface MemoryTailResult {
  text: string
  recall?: MemoryRecallTrace
}
export interface RetrieveMemoryOptions {
  factLimit?: number
  episodeLimit?: number
}
export interface MemorySearchInput {
  userId: string
  query: string
  queryVector: number[] | null
  limit: number
  topics: MemoryTopic[]
}
export interface MemorySearchSource {
  table: SQL
  id: SQL
  content: SQL
  embedding: SQL
  recordedAt: SQL
  topicKey: SQL<string | null>
  scope: SQL
  kind: 'fact' | 'episode'
}
