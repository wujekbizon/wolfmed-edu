import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { buildWolfekAnswers } from './buildWolfekAnswers'
import { getWolfekFact } from './getWolfekFact'
import { getWolfekPreparedOptions } from './getWolfekPreparedOptions'
import type { WolfekContext, WolfekPack, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

export function getWolfekPreparedAnswer(input: WolfekQuestionRequest, pack: WolfekPack, context: WolfekContext) {
  const options = getWolfekPreparedOptions(input, pack)
  const answers = buildWolfekAnswers({ ...pack, options }, context)
  const matching = options.find((option) => option.conditions.every((condition) =>
    getWolfekFact(context.facts, condition.path) === condition.equals))
  const answer = matching ? answers[matching.id] ?? answers[`unavailable_${matching.id}`]
    : options.map(option => answers[`unavailable_${option.id}`]).find(Boolean)
  if (!answer) throw new WolfekQuestionError('Nie mogę teraz przygotować tej odpowiedzi.')
  return answer
}
