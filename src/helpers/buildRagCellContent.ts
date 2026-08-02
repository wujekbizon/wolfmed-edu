import type { RagExplainOrigin } from '@/types/ragCellTypes'

export function buildRagCellContent(topic: string, origin?: RagExplainOrigin): string {
  return JSON.stringify({ topic, messages: [], ...(origin ? { origin } : {}) })
}
