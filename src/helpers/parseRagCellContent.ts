import type { RagCellContent, RagExplainOrigin, RagMessage } from '@/types/ragCellTypes'

function parseMessages(value: unknown): RagMessage[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((entry): RagMessage[] => {
    if (typeof entry !== 'object' || entry === null) return []
    const { role, text, sources } = entry as Partial<RagMessage>
    if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string') return []

    const validSources = Array.isArray(sources)
      ? sources.filter((source): source is string => typeof source === 'string')
      : undefined

    return [{ role, text, ...(validSources?.length ? { sources: validSources } : {}) }]
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

  const { topic, messages, origin } = parsed as Record<string, unknown>
  const parsedOrigin = parseOrigin(origin)

  return {
    topic: typeof topic === 'string' ? topic : '',
    messages: parseMessages(messages),
    ...(parsedOrigin ? { origin: parsedOrigin } : {}),
  }
}
