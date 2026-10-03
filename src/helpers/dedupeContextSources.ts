import type { ContextChunk, SourceRef } from '@/types/retrievalTypes'

export function dedupeContextSources(chunks: ContextChunk[]): SourceRef[] {
  const sources = new Map<string, SourceRef>()
  for (const chunk of chunks) {
    sources.set(`${chunk.origin}:${chunk.label}`, {
      label: chunk.label,
      origin: chunk.origin,
    })
  }
  return [...sources.values()]
}
