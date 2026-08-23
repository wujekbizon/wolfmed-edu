import type { GenerateContentResponseUsageMetadata } from '@google/genai'
import type { ModelTokenUsage } from '@/types/memoryTypes'

export function getModelTokenUsage(
  usage: GenerateContentResponseUsageMetadata | undefined
): ModelTokenUsage | undefined {
  if (!usage) return undefined
  const inputTokens = usage.promptTokenCount ?? 0
  const outputTokens = usage.candidatesTokenCount ?? 0
  const thoughtTokens = usage.thoughtsTokenCount ?? 0
  return {
    inputTokens,
    outputTokens,
    thoughtTokens,
    totalTokens: usage.totalTokenCount ?? inputTokens + outputTokens + thoughtTokens,
  }
}
