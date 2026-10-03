import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { WolfekQuestionSchema } from '@/server/schema'
import { getWolfekPreparedQuestion } from './getWolfekPreparedQuestion'

export function resolveWolfekQuestionInput(data: FormData) {
  const input = WolfekQuestionSchema.parse({
    route: data.get('route'), question: data.get('question'), origin: data.get('origin') ?? 'typed',
    preparedQuestionId: data.get('preparedQuestionId') || null, submissionId: data.get('submissionId'),
    practice: data.get('practice') ? JSON.parse(String(data.get('practice'))) : null,
  })
  if (input.origin === 'prepared') {
    const question = input.preparedQuestionId ? getWolfekPreparedQuestion(input.route, input.preparedQuestionId) : null
    if (!question || question.prompt !== input.question) throw new WolfekQuestionError('Nieprawidłowe przygotowane pytanie.')
  } else if (input.preparedQuestionId) {
    throw new WolfekQuestionError('Nieprawidłowy rodzaj pytania.')
  }
  return input
}
