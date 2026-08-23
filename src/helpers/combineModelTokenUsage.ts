import type { ModelTokenUsage } from '@/types/memoryTypes'

export function combineModelTokenUsage(
  ...usages: Array<ModelTokenUsage | undefined>
): ModelTokenUsage | undefined {
  const present = usages.filter((usage): usage is ModelTokenUsage => Boolean(usage))
  if (present.length === 0) return undefined
  return present.reduce(
    (total, usage) => ({
      inputTokens: total.inputTokens + usage.inputTokens,
      outputTokens: total.outputTokens + usage.outputTokens,
      thoughtTokens: total.thoughtTokens + usage.thoughtTokens,
      totalTokens: total.totalTokens + usage.totalTokens,
    }),
    { inputTokens: 0, outputTokens: 0, thoughtTokens: 0, totalTokens: 0 }
  )
}
