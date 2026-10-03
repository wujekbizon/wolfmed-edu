import { JEV_MODEL } from '@/constants/jev'
import { WolfekJevResponseSchema } from '@/server/schema'
import type { WolfekDecision } from '@/types/wolfekResponseTypes'

export function parseWolfekResponse(raw: unknown, allowed: string[]): WolfekDecision | null {
  const parsed = WolfekJevResponseSchema.safeParse(raw)
  if (!parsed.success || parsed.data.model !== JEV_MODEL) return null
  const { response, needs_clarification, answer_coverage } = parsed.data.answers
  if (Object.keys(answer_coverage.legend).length !== 4 ||
    ['0', '1', '2', '3'].some((key) => !Object.hasOwn(answer_coverage.legend, key))) return null
  for (const [values, keys] of [[response.probabilities, allowed],
    [answer_coverage.probabilities, ['0', '1', '2', '3']]] as const) {
    if (Object.keys(values).length !== keys.length || keys.some((key) => values[key] === undefined)) return null
    // Jev's two-decimal distributions can total 0.99 or 1.01 after rounding.
    if (Math.abs(Object.values(values).reduce((sum, value) => sum + value, 0) - 1) > .01 + 1e-9) return null
  }
  if (!allowed.includes(response.choice) ||
    Math.max(...Object.values(response.probabilities)) - response.probabilities[response.choice]! > .01 + 1e-9) return null
  return { responseId: response.choice, confidence: response.confidence,
    clarificationProbability: needs_clarification.noul, coverage: answer_coverage.score }
}
