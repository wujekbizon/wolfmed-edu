import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { WOLFEK_TOPIC_MIN_CONFIDENCE } from '@/constants/wolfekRouting'
import { parseWolfekResponse } from './parseWolfekResponse'
import type { WolfekBuiltRequest, WolfekResponseEvaluator } from '@/types/wolfekResponseTypes'

export async function evaluateWolfekResponse(built: WolfekBuiltRequest, evaluate: WolfekResponseEvaluator) {
  const decision = await evaluate(built.payload, (raw) => parseWolfekResponse(raw, Object.keys(built.answers)))
  if (!decision) throw new WolfekQuestionError('Jev nie zwrócił poprawnej odpowiedzi. Spróbuj ponownie.')
  const answer = decision.confidence >= WOLFEK_TOPIC_MIN_CONFIDENCE ? built.answers[decision.responseId] ?? null : null
  return { decision, answer }
}
