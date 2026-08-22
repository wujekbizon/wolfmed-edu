import type { RagExplainOrigin } from '@/types/ragCellTypes'

interface RagCellSeed {
  origin?: RagExplainOrigin
  searchTopic?: string
}

export function buildRagCellContent(topic: string, seed: RagCellSeed = {}): string {
  return JSON.stringify({
    topic,
    messages: [],
    ...(seed.origin ? { origin: seed.origin } : {}),
    ...(seed.searchTopic ? { searchTopic: seed.searchTopic } : {}),
  })
}
