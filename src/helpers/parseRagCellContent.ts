import type { RagCellContent, RagExplainOrigin, RagMessage } from '@/types/ragCellTypes'
import type { ChunkOrigin, SourceRef } from '@/types/retrievalTypes'

const ORIGINS: ChunkOrigin[] = ['corpus', 'note', 'material']

// Cells written before sources carried an origin hold bare strings. Those
// answers predate personal retrieval entirely, so 'corpus' is not a guess — it
// is the only thing they could have been.
function parseSources(value: unknown): SourceRef[] | undefined {
  if (!Array.isArray(value)) return undefined

  const sources = value.flatMap((entry): SourceRef[] => {
    if (typeof entry === 'string') return [{ label: entry, origin: 'corpus' }]
    if (typeof entry !== 'object' || entry === null) return []

    const { label, origin } = entry as Partial<SourceRef>
    if (typeof label !== 'string') return []

    return [{ label, origin: ORIGINS.includes(origin as ChunkOrigin) ? origin! : 'corpus' }]
  })

  return sources.length > 0 ? sources : undefined
}

function parseMessages(value: unknown): RagMessage[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((entry): RagMessage[] => {
    if (typeof entry !== 'object' || entry === null) return []
    const { role, text, sources } = entry as Partial<RagMessage>
    if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string') return []

    const validSources = parseSources(sources)

    return [{ role, text, ...(validSources ? { sources: validSources } : {}) }]
  })
}

function parseOrigin(value: unknown): RagExplainOrigin | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const { mapCellId, nodeId } = value as Partial<RagExplainOrigin>
  if (typeof mapCellId !== 'string' || typeof nodeId !== 'string') return undefined
  return { mapCellId, nodeId }
}

export function parseRagCellContent(raw: string): RagCellContent {
  if (!raw) return { topic: '', messages: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { topic: raw, messages: [] }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { topic: raw, messages: [] }
  }

  const { topic, messages, origin, searchTopic } = parsed as Record<string, unknown>
  const parsedOrigin = parseOrigin(origin)

  return {
    topic: typeof topic === 'string' ? topic : '',
    messages: parseMessages(messages),
    ...(parsedOrigin ? { origin: parsedOrigin } : {}),
    ...(typeof searchTopic === 'string' && searchTopic ? { searchTopic } : {}),
  }
}
