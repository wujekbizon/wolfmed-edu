import type { WolfekAdminDaily } from '@/types/wolfekAdminTypes'

export function fillWolfekDailyChart(rows: WolfekAdminDaily[], from: string, to: string): WolfekAdminDaily[] {
  const days = new Map(rows.map((row) => [row.day, row]))
  const result: WolfekAdminDaily[] = []
  for (let timestamp = Date.parse(from); timestamp <= Date.parse(to); timestamp += 86_400_000) {
    const day = new Date(timestamp).toISOString().slice(0, 10)
    result.push(days.get(day) ?? { day, questions: 0, clicks: 0, cacheHits: 0,
      providerCalls: 0, errors: 0, inputTokens: 0, outputTokens: 0 })
  }
  return result
}
