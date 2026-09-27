import 'server-only'
import { JEV_ENDPOINT, JEV_INSTRUCTIONS, JEV_MODEL, JEV_TIMEOUT_MS } from '@/constants/jev'
import { JevResponseSchema } from '@/server/schema'
import type { JevCandidate, JevDecision, JevState } from '@/types/jevTypes'

export async function selectJevSupport(apiKey: string, state: JevState, candidates: JevCandidate[]): Promise<JevDecision | null> {
  try {
    const criteria = Object.fromEntries(candidates.map((candidate) => [candidate.id, candidate.text]))
    const response = await fetch(JEV_ENDPOINT, {
      method: 'POST', cache: 'no-store', redirect: 'error',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(JEV_TIMEOUT_MS),
      body: JSON.stringify({ model: JEV_MODEL, state, questions: {
        support: { type: 'choice', instructions: JEV_INSTRUCTIONS,
          criteria: { ...criteria, none: 'No recommendation is useful now.' } },
      } }),
    })
    if (!response.ok) return null
    const text = await response.text()
    if (text.length > 64_000) return null
    const parsed = JevResponseSchema.safeParse(JSON.parse(text))
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
  } catch {
    return null
  }
}
