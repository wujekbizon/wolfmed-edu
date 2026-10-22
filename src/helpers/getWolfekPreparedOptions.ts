import prepared from '@/content/wolfek/prepared-answers.json'
import { WolfekPreparedAnswersSchema } from '@/server/schema'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import type { WolfekPack, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

const mappings = WolfekPreparedAnswersSchema.parse(prepared)

export function getWolfekPreparedOptions(input: WolfekQuestionRequest, pack: WolfekPack) {
  const route = mappings[input.route]
  const id = input.preparedQuestionId
  if (input.origin !== 'prepared' || !id || !Object.hasOwn(route, id)) {
    throw new WolfekQuestionError('Nieprawidłowe przygotowane pytanie.')
  }
  const mapping = route[id]!
  return mapping.responses.map(responseId => {
    const option = pack.options.find(candidate => candidate.id === responseId)
    if (!option) throw new WolfekQuestionError('Brak przygotowanej odpowiedzi.')
    return mapping.destinationKey && option.action
      ? { ...option, action: { ...option.action, destinationKey: mapping.destinationKey } } : option
  })
}
