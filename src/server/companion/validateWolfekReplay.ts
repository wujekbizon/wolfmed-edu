import 'server-only'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { buildWolfekResponseRequest } from '@/helpers/buildWolfekResponseRequest'
import { expandWolfekCourseResponses } from '@/helpers/expandWolfekCourseResponses'
import { loadWolfekResponsePack } from './loadWolfekResponsePack'
import { getWolfekAppContext } from './getWolfekAppContext'
import { getWolfekPracticeContext } from './getWolfekPracticeContext'
import type { WolfekQuestionRequest, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function validateWolfekReplay(userId: string | null, input: WolfekQuestionRequest, result: WolfekQuestionState) {
  const practice = input.practice && result.session
    ? { ...input.practice, sessionId: result.session.id, version: result.session.version } : input.practice
  const [rawPack, context] = await Promise.all([
    loadWolfekResponsePack(input.route), practice ? getWolfekPracticeContext(userId!, practice)
      : getWolfekAppContext(userId, input.route),
  ])
  if (result.values?.learningGenerated) return
  if (!result.answer) return
  const pack = input.route === 'kierunki' ? expandWolfekCourseResponses(rawPack) : rawPack
  const fresh = buildWolfekResponseRequest(input, pack, context).answers[result.answer.responseId]
  if (JSON.stringify(fresh) !== JSON.stringify(result.answer)) {
    throw new WolfekQuestionError('Dane lub dostęp uległy zmianie. Wyślij nowe pytanie.')
  }
}
