import type { RetrievalTier } from '@/server/memory/config'

export type MemoryRetrievalMode = 'hybrid' | 'vector-only' | 'trgm-only' | 'ilike'

export interface ScoredMemoryRow {
  id: string
  content: string
  score: number
}

export interface RankedMemoryRow extends ScoredMemoryRow {
  tier: RetrievalTier
}

export interface MemoryHit extends RankedMemoryRow {
  kind: 'fact' | 'episode'
  selectionReason: 'semantic' | 'recent' | 'fallback'
}

export interface MemorySearchResult {
  hits: MemoryHit[]
  mode: MemoryRetrievalMode
}

export interface MemoryRecallResult {
  facts: MemoryHit[]
  episodes: MemoryHit[]
  modes: { facts: MemoryRetrievalMode; episodes: MemoryRetrievalMode }
}

export interface MemoryRecallTrace {
  facts: Array<Pick<MemoryHit, 'id' | 'score' | 'tier' | 'selectionReason'>>
  episodes: Array<Pick<MemoryHit, 'id' | 'score' | 'tier' | 'selectionReason'>>
  modes: MemoryRecallResult['modes']
}

export interface MemoryTailResult {
  text: string
  recall?: MemoryRecallTrace
}
