import 'server-only'
import { randomUUID } from 'node:crypto'
import { getRedis } from '@/lib/redis'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { toFormState } from '@/helpers/toFormState'
import { buildWolfekPreparedBatch } from '@/helpers/buildWolfekPreparedBatch'
import { evaluateWolfekPreparedBatch } from '@/helpers/evaluateWolfekPreparedBatch'
import { callJev } from '@/server/jev/callJev'
import { recordWolfekInteraction } from '@/server/jev/recordWolfekInteraction'
import { completeWolfekBatchAudit } from '@/server/jev/completeWolfekBatchAudit'
import { WOLFEK_BATCH_RECEIPT_SECONDS } from '@/constants/wolfekJudgments'
import { authorizeWolfekQuestion } from './authorizeWolfekQuestion'
import { getKierunkiWolfekRateLimitIdentity } from './getKierunkiWolfekRateLimitIdentity'
import { beginWolfekSubmission } from './beginWolfekSubmission'
import { reserveCompanionJevCall } from './reserveCompanionJevCall'
import { loadWolfekQuestionData } from './loadWolfekQuestionData'
import type { WolfekBatchReceipt, WolfekBatchRequest, WolfekBatchState } from '@/types/wolfekBatchTypes'

export async function loadWolfekPreparedBatch(userId: string | null, input: WolfekBatchRequest): Promise<WolfekBatchState> {
  if (input.origin !== 'prepared') throw new WolfekQuestionError('Nieprawidłowe przygotowane pytanie.')
  await authorizeWolfekQuestion(userId, input)
  const identity = await getKierunkiWolfekRateLimitIdentity(userId)
  const submission = await beginWolfekSubmission<WolfekBatchState>(`${identity}:batch`, input)
  if (submission.reused) return submission.reused
  const started = Date.now()
  const source = input.route === 'kierunki' ? 'kierunki' : input.route === 'learning.practice' ? 'practice' : 'panel'
  let result: WolfekBatchState = { ...toFormState('ERROR', 'Nie mogę pobrać odpowiedzi.'), batch: null }
  try {
    const key = process.env.TYPESAFE_API_KEY
    if (!key) throw new WolfekQuestionError('Usługa Jev jest teraz niedostępna.')
    if (!await reserveCompanionJevCall(identity, input.submissionId)) throw new WolfekQuestionError('Zbyt wiele pytań. Spróbuj później.')
    const data = await loadWolfekQuestionData(userId, input)
    const built = buildWolfekPreparedBatch(input, data.pack, data.context)
    const states = await evaluateWolfekPreparedBatch(built, (payload, parse) =>
      callJev(key, payload, { source, route: input.route, userId,
        sessionId: input.practice?.sessionId ?? null, policyVersion: data.pack.version }, parse))
    await authorizeWolfekQuestion(userId, input)
    if (input.practice && (await loadWolfekQuestionData(userId, input)).contextVersion !== data.contextVersion) {
      throw new WolfekQuestionError('Karta uległa zmianie. Zapytaj ponownie.')
    }
    const id = randomUUID()
    const receipt: WolfekBatchReceipt = { request: input, states, contextVersion: data.contextVersion, consumed: false }
    const redis = getRedis()
    if (!redis) throw new WolfekQuestionError('Nie mogę zapisać wyników tego pytania.')
    await redis.set(`wolfek:prepared:${identity}:${id}`, receipt, { ex: WOLFEK_BATCH_RECEIPT_SECONDS })
    const visibleStates = Object.fromEntries(Object.entries(states).map(([button, state]) => [button,
      state.answer?.action?.type === 'show_hint' ? { ...state, answer: { ...state.answer,
        text: 'Sprawdzona wskazówka jest gotowa. Wybierz pytanie o wskazówkę, aby ją otworzyć.' } } : state]))
    result = { ...toFormState('SUCCESS', ''), batch: { id, visitId: input.visitId,
      contextVersion: data.contextVersion, states: visibleStates } }
  } catch (error) {
    result = { ...toFormState('ERROR', error instanceof WolfekQuestionError ? error.message : 'Nie mogę teraz pobrać odpowiedzi.'), batch: null }
  }
  await recordWolfekInteraction({ source, route: input.route, userId, kind: 'prepared_batch',
    question: `Przygotowane pytania: ${input.route}`, topic: null, confidence: null,
    outcome: result.batch ? 'provider' : 'unavailable' })
  await completeWolfekBatchAudit(input, userId, result, Date.now() - started)
  try { await submission.complete(result) } catch {}
  return result
}
