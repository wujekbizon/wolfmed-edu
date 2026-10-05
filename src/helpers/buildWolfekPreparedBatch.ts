import { buildWolfekResponseRequest } from './buildWolfekResponseRequest'
import { buildWolfekJudgments } from './buildWolfekJudgments'
import questions from '@/content/wolfek/questions.json'
import type { WolfekContext, WolfekPack, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'
import type { WolfekBuiltBatch } from '@/types/wolfekBatchTypes'

export function buildWolfekPreparedBatch(input: WolfekQuestionRequest, pack: WolfekPack, context: WolfekContext): WolfekBuiltBatch {
  const built = buildWolfekResponseRequest(input, pack, context)
  const preparedQuestions = questions[input.route].map(({ id, prompt }) => ({ id, prompt }))
  const state = built.payload.state as Record<string, unknown>
  const criteria = Object.fromEntries(Object.keys(built.answers).map((id) => [id, null]))
  const judgments: Record<string, unknown> = {}
  for (const button of preparedQuestions) {
    const family = buildWolfekJudgments(`state.preparedQuestions.${button.id}`, criteria)
    for (const [kind, question] of Object.entries(family)) judgments[`${button.id}__${kind}`] = question
  }
  return { answers: built.answers, preparedQuestions, payload: { model: built.payload.model,
    state: { ...state, question: `Przygotowane pytania: ${input.route}`,
      preparedQuestions: Object.fromEntries(preparedQuestions.map((button) => [button.id, button.prompt])),
      submission: { id: input.submissionId, origin: 'prepared_batch' } },
    questions: judgments } }
}
