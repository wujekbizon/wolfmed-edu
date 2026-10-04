import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import 'server-only'
import { toFormState } from '@/helpers/toFormState'
import { buildWolfekResponseRequest } from '@/helpers/buildWolfekResponseRequest'
import { expandWolfekCourseResponses } from '@/helpers/expandWolfekCourseResponses'
import { evaluateWolfekResponse } from '@/helpers/evaluateWolfekResponse'
import { callJev } from '@/server/jev/callJev'
import { completeWolfekAudit } from '@/server/jev/completeWolfekAudit'
import { recordWolfekInteraction } from '@/server/jev/recordWolfekInteraction'
import { loadWolfekResponsePack } from './loadWolfekResponsePack'
import { getWolfekAppContext } from './getWolfekAppContext'
import { getWolfekPracticeContext } from './getWolfekPracticeContext'
import { authorizeWolfekQuestion } from './authorizeWolfekQuestion'
import { beginWolfekSubmission } from './beginWolfekSubmission'
import { validateWolfekReplay } from './validateWolfekReplay'
import { getKierunkiWolfekRateLimitIdentity } from './getKierunkiWolfekRateLimitIdentity'
import { reserveCompanionJevCall } from './reserveCompanionJevCall'
import { deliverWolfekPracticeHint } from './deliverWolfekPracticeHint'
import { deliverWolfekLearningHelp } from './deliverWolfekLearningHelp'
import type { WolfekQuestionRequest, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function executeWolfekQuestion(userId: string | null, input: WolfekQuestionRequest): Promise<WolfekQuestionState> {
  if (input.origin !== 'typed') throw new WolfekQuestionError('Przygotowane pytania wymagają wspólnego pakietu odpowiedzi.')
  await authorizeWolfekQuestion(userId, input)
  const started = Date.now()
  const identity = await getKierunkiWolfekRateLimitIdentity(userId)
  const submission = await beginWolfekSubmission(identity, input)
  if (submission.reused) {
    await validateWolfekReplay(userId, input, submission.reused)
    return submission.reused
  }
  const source = input.route === 'kierunki' ? 'kierunki' : input.route === 'learning.practice' ? 'practice' : 'panel'
  let result: WolfekQuestionState = { ...toFormState('ERROR', 'Nie mogę teraz odpowiedzieć.'), answer: null, confidence: null }
  let selected: string | null = null
  let attempted = false
  try {
    const apiKey = process.env.TYPESAFE_API_KEY
    if (!apiKey) throw new WolfekQuestionError('Usługa Jev jest teraz niedostępna.')
    if (!await reserveCompanionJevCall(identity, input.submissionId)) {
      throw new WolfekQuestionError('Zbyt wiele pytań. Spróbuj ponownie za chwilę.')
    }
    const [rawPack, context] = await Promise.all([
      loadWolfekResponsePack(input.route), input.practice
        ? getWolfekPracticeContext(userId!, input.practice) : getWolfekAppContext(userId, input.route),
    ])
    const pack = input.route === 'kierunki' ? expandWolfekCourseResponses(rawPack) : rawPack
    const built = buildWolfekResponseRequest(input, pack, context)
    attempted = true
    const { decision, answer } = await evaluateWolfekResponse(built, (payload, parse) =>
      callJev(apiKey, payload, { source, route: input.route, userId,
        sessionId: input.practice?.sessionId ?? null, policyVersion: pack.version }, parse))
    selected = decision.responseId
    await authorizeWolfekQuestion(userId, input)
    if (input.practice) {
      const fresh = buildWolfekResponseRequest(input, pack, await getWolfekPracticeContext(userId!, input.practice))
      if (JSON.stringify(fresh.answers[selected]) !== JSON.stringify(built.answers[selected])) {
        throw new WolfekQuestionError('Dostęp lub propozycja pomocy uległy zmianie. Zapytaj ponownie.')
      }
    }
    result = { ...toFormState('SUCCESS', ''), answer, confidence: decision.confidence }
    if (input.practice && answer?.action?.type === 'show_hint') {
      result.session = await deliverWolfekPracticeHint(userId!, input.practice, input.submissionId)
    }
    if (input.practice) result = await deliverWolfekLearningHelp(userId!, input, result)
  } catch (error) {
    result = { ...toFormState('ERROR', error instanceof WolfekQuestionError ? error.message : 'Nie mogę teraz pobrać danych. Spróbuj później.'),
      answer: null, confidence: null }
  }
  await recordWolfekInteraction({ source, route: input.route, userId, kind: 'question',
    question: input.question, topic: selected, confidence: result.confidence,
    outcome: result.status === 'SUCCESS' && attempted ? 'typed_provider' : 'unavailable' })
  result.values = { ...result.values, preparedQuestionId: input.preparedQuestionId, origin: input.origin,
    practiceVersion: input.practice?.version ?? null }
  await completeWolfekAudit(input, userId, result, Date.now() - started)
  try { await submission.complete(result) } catch {}
  return result
}
