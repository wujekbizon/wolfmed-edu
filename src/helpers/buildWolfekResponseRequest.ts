import { JEV_MODEL } from '@/constants/jev'
import { buildWolfekAnswers } from './buildWolfekAnswers'
import { getWolfekDecisionFacts } from './getWolfekDecisionFacts'
import { buildWolfekJudgments } from './buildWolfekJudgments'
import { WOLFEK_RESPONSE_RULES } from '@/constants/wolfekJudgments'
import type { WolfekBuiltRequest, WolfekContext, WolfekPack, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

export function buildWolfekResponseRequest(
  input: WolfekQuestionRequest, pack: WolfekPack, context: WolfekContext,
): WolfekBuiltRequest {
  const answers = buildWolfekAnswers(pack, context)
  const criteria = Object.fromEntries(Object.keys(answers).map((id) => [id, null]))
  return { answers, payload: { model: JEV_MODEL, state: {
    route: input.route, question: input.question, facts: getWolfekDecisionFacts(context.facts), rules: WOLFEK_RESPONSE_RULES,
    responseOptions: Object.fromEntries(Object.entries(answers).map(([id, answer]) => [id, {
      text: answer.text, covers: pack.options.find((option) => option.id === id || `unavailable_${option.id}` === id)?.covers,
      availability: id.startsWith('unavailable_') ? 'missing_data' : 'verified',
    }])),
    submission: { id: input.submissionId, origin: input.origin },
    ...(input.origin === 'typed' && input.recentMessages?.length ? { conversation: input.recentMessages } : {}),
  }, questions: buildWolfekJudgments('state.question', criteria as Record<string, null>) } }
}
