import { JEV_MODEL } from '@/constants/jev'
import { PANEL_WOLFEK_TOPIC_IDS } from '@/constants/panelWolfek'
import { PanelJevResponseSchema } from '@/server/schema'
import type { PanelWolfekTopic } from '@/types/panelWolfekTypes'

export function parsePanelJevChoice(raw: unknown): {
  topic: PanelWolfekTopic | 'other'
  confidence: number
} | null {
  const parsed = PanelJevResponseSchema.safeParse(raw)
  if (!parsed.success || parsed.data.model !== JEV_MODEL) return null
  const answer = parsed.data.answers.help
  const allowed = [...PANEL_WOLFEK_TOPIC_IDS, 'other']
  if (!allowed.includes(answer.choice) || Object.keys(answer.probabilities).length !== allowed.length ||
    allowed.some((id) => answer.probabilities[id] === undefined)) return null
  const probabilities = Object.values(answer.probabilities)
  if (Math.abs(probabilities.reduce((sum, value) => sum + value, 0) - 1) > 0.001 ||
    answer.probabilities[answer.choice]! < Math.max(...probabilities)) return null
  return { topic: answer.choice as PanelWolfekTopic | 'other', confidence: answer.confidence }
}
