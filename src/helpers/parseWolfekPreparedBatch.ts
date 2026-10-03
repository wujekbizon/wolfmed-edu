import { WolfekBatchEnvelopeSchema } from '@/server/schema'
import { JEV_MODEL } from '@/constants/jev'
import { parseWolfekResponse } from './parseWolfekResponse'
import type { WolfekBatchDecisions } from '@/types/wolfekBatchTypes'

export function parseWolfekPreparedBatch(raw: unknown, buttons: string[], allowed: string[]): WolfekBatchDecisions | null {
  const parsed = WolfekBatchEnvelopeSchema.safeParse(raw)
  if (!parsed.success || parsed.data.model !== JEV_MODEL) return null
  const result: WolfekBatchDecisions = {}
  for (const id of buttons) {
    const decision = parseWolfekResponse({ model: parsed.data.model, usage: parsed.data.usage,
      answers: { response: parsed.data.answers[`${id}__response`],
        needs_clarification: parsed.data.answers[`${id}__needs_clarification`],
        answer_coverage: parsed.data.answers[`${id}__answer_coverage`] } }, allowed)
    if (!decision) return null
    result[id] = decision
  }
  return result
}
