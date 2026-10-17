import { JEV_MODEL } from '@/constants/jev'
import { KIERUNKI_WOLFEK_TOPIC_IDS } from '@/constants/kierunkiWolfek'
import { KierunkiJevResponseSchema } from '@/server/schema'
import type { KierunkiWolfekTopic } from '@/types/kierunkiWolfekTypes'

export function parseKierunkiJevChoice(raw: unknown): {
  topic: KierunkiWolfekTopic | 'other'
  confidence: number
} | null {
  const parsed = KierunkiJevResponseSchema.safeParse(raw)
  if (!parsed.success || parsed.data.model !== JEV_MODEL) return null
  const answer = parsed.data.answers.guide
  const allowed = [...KIERUNKI_WOLFEK_TOPIC_IDS, 'other']
  if (!allowed.includes(answer.choice as KierunkiWolfekTopic | 'other') ||
    Object.keys(answer.probabilities).length !== allowed.length ||
    allowed.some((topic) => answer.probabilities[topic] === undefined)) return null
  const probabilities = Object.values(answer.probabilities)
  if (Math.abs(probabilities.reduce((sum, value) => sum + value, 0) - 1) > 0.001 ||
    answer.probabilities[answer.choice]! < Math.max(...probabilities)) return null
  return { topic: answer.choice as KierunkiWolfekTopic | 'other', confidence: answer.confidence }
}
