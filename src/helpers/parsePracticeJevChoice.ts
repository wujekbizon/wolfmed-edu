import { JEV_MODEL } from '@/constants/jev'
import { JevResponseSchema } from '@/server/schema'
import type { JevCandidate, JevDecision } from '@/types/jevTypes'

export function parsePracticeJevChoice(raw: unknown, candidates: JevCandidate[]): JevDecision | null {
  const parsed = JevResponseSchema.safeParse(raw)
  if (!parsed.success || parsed.data.model !== JEV_MODEL) return null
  const answer = parsed.data.answers.support
  const allowed = [...candidates.map((candidate) => candidate.id), 'none']
  const probabilities = answer.probabilities
  if (Object.keys(probabilities).length !== allowed.length ||
    allowed.some((id) => probabilities[id] === undefined) || !allowed.includes(answer.choice)) return null
  const sum = Object.values(probabilities).reduce((total, value) => total + value, 0)
  if (Math.abs(sum - 1) > 0.001 || probabilities[answer.choice]! < Math.max(...Object.values(probabilities))) return null
  return { choice: answer.choice, confidence: answer.confidence, probabilities,
    inputTokens: parsed.data.usage.input_tokens, outputTokens: parsed.data.usage.output_tokens }
}
