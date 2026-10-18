import prepared from '@/content/wolfek/prepared-answers.json'
import { WolfekPreparedAnswersSchema } from '@/server/schema'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { buildWolfekAnswers } from './buildWolfekAnswers'
import { getWolfekFact } from './getWolfekFact'
import type { WolfekContext, WolfekPack, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

const mappings = WolfekPreparedAnswersSchema.parse(prepared)

export function getWolfekPreparedAnswer(input: WolfekQuestionRequest, pack: WolfekPack, context: WolfekContext) {
  const route = mappings[input.route]
  const id = input.preparedQuestionId
  if (input.origin !== 'prepared' || !id || !Object.hasOwn(route, id)) {
    throw new WolfekQuestionError('Nieprawidłowe przygotowane pytanie.')
  }
  const mapping = route[id]!
  const options = mapping.responses.map((responseId) => {
    const option = pack.options.find((candidate) => candidate.id === responseId)
    if (!option) throw new WolfekQuestionError('Brak przygotowanej odpowiedzi.')
    return mapping.destinationKey && option.action
      ? { ...option, action: { ...option.action, destinationKey: mapping.destinationKey } } : option
  })
  const answers = buildWolfekAnswers({ ...pack, options }, context)
  const matching = options.find((option) => option.conditions.every((condition) =>
    getWolfekFact(context.facts, condition.path) === condition.equals))
  const answer = matching ? answers[matching.id] ?? answers[`unavailable_${matching.id}`]
    : mapping.responses.map((responseId) => answers[`unavailable_${responseId}`]).find(Boolean)
  if (!answer) throw new WolfekQuestionError('Nie mogę teraz przygotować tej odpowiedzi.')
  return answer
}
