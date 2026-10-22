import 'server-only'
import { checkRateLimit } from '@/lib/rateLimit'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { toFormState } from '@/helpers/toFormState'
import { getWolfekPreparedAnswer } from '@/helpers/getWolfekPreparedAnswer'
import { recordWolfekInteraction } from '@/server/jev/recordWolfekInteraction'
import { PracticeConflictError } from '@/server/learning/PracticeConflictError'
import { authorizeWolfekQuestion } from './authorizeWolfekQuestion'
import { getKierunkiWolfekRateLimitIdentity } from './getKierunkiWolfekRateLimitIdentity'
import { beginWolfekSubmission } from './beginWolfekSubmission'
import { loadWolfekResponsePack } from './loadWolfekResponsePack'
import { getWolfekPreparedContext } from './getWolfekPreparedContext'
import { getWolfekPracticeContext } from './getWolfekPracticeContext'
import { createWolfekPracticeCardReader } from './createWolfekPracticeCardReader'
import { validateWolfekReplay } from './validateWolfekReplay'
import { deliverWolfekLearningHelp } from './deliverWolfekLearningHelp'
import type { WolfekQuestionRequest, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function executeWolfekPreparedQuestion(userId: string | null, input: WolfekQuestionRequest) {
  if (input.origin !== 'prepared' || Boolean(input.practice) !== (input.route === 'learning.practice')) {
    throw new WolfekQuestionError('Nieprawidłowe przygotowane pytanie.')
  }
  await authorizeWolfekQuestion(userId, input)
  const identity = await getKierunkiWolfekRateLimitIdentity(userId)
  if (!(await checkRateLimit(identity, input.route === 'kierunki' ? 'kierunki:request' : 'panel:wolfek')).success) {
    throw new WolfekQuestionError('Zbyt wiele pytań. Spróbuj ponownie za chwilę.')
  }
  const submission = await beginWolfekSubmission(`${identity}:prepared`, input)
  if (submission.reused) {
    await validateWolfekReplay(userId, input, submission.reused)
    return submission.reused
  }
  let result: WolfekQuestionState
  try {
    const pack = await loadWolfekResponsePack(input.route)
    const readCard = input.practice ? createWolfekPracticeCardReader(userId!) : undefined
    const context = input.practice ? await getWolfekPracticeContext(userId!, input.practice, readCard)
      : await getWolfekPreparedContext(userId, input, pack)
    result = { ...toFormState('SUCCESS', ''), answer: getWolfekPreparedAnswer(input, pack, context), confidence: null }
    if (input.practice) result = await deliverWolfekLearningHelp(userId!, input, result, readCard)
  } catch (error) {
    result = { ...toFormState('ERROR', error instanceof WolfekQuestionError || error instanceof PracticeConflictError
      ? error.message : 'Nie mogę teraz przygotować odpowiedzi.'), answer: null, confidence: null,
      ...(error instanceof PracticeConflictError ? { session: error.session } : {}) }
  }
  result.values = { ...result.values, origin: 'prepared', preparedQuestionId: input.preparedQuestionId,
    practiceVersion: input.practice?.version ?? null }
  await recordWolfekInteraction({ source: input.route === 'kierunki' ? 'kierunki'
    : input.route === 'learning.practice' ? 'practice' : 'panel', route: input.route, userId,
    kind: 'question', question: input.question, topic: result.answer?.responseId ?? null, confidence: null,
    outcome: result.status === 'SUCCESS' ? 'prepared' : 'unavailable' })
  try { await submission.complete(result) } catch {}
  return result
}
