import { WOLFEK_TOPIC_MIN_CONFIDENCE } from '@/constants/wolfekRouting'
import { toFormState } from './toFormState'
import { parseWolfekPreparedBatch } from './parseWolfekPreparedBatch'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import type { WolfekBuiltBatch, WolfekBatchEvaluator } from '@/types/wolfekBatchTypes'
import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function evaluateWolfekPreparedBatch(built: WolfekBuiltBatch, evaluate: WolfekBatchEvaluator) {
  const decisions = await evaluate(built.payload, (raw) =>
    parseWolfekPreparedBatch(raw, built.preparedQuestions.map((button) => button.id), Object.keys(built.answers)))
  if (!decisions) throw new WolfekQuestionError('Jev nie zwrócił poprawnych odpowiedzi. Spróbuj ponownie.')
  const states: Record<string, WolfekQuestionState> = {}
  for (const { id } of built.preparedQuestions) {
    const decision = decisions[id]!
    states[id] = { ...toFormState('SUCCESS', ''), confidence: decision.confidence,
      answer: decision.confidence >= WOLFEK_TOPIC_MIN_CONFIDENCE ? built.answers[decision.responseId] ?? null : null }
  }
  return states
}
