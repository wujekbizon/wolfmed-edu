import 'server-only'
import { getRedis } from '@/lib/redis'
import { checkRateLimit } from '@/lib/rateLimit'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { toFormState } from '@/helpers/toFormState'
import { buildWolfekResponseRequest } from '@/helpers/buildWolfekResponseRequest'
import { recordWolfekInteraction } from '@/server/jev/recordWolfekInteraction'
import { recordWolfekBatchDelivery } from '@/server/jev/recordWolfekBatchDelivery'
import { WOLFEK_BATCH_RECEIPT_SECONDS } from '@/constants/wolfekJudgments'
import { authorizeWolfekQuestion } from './authorizeWolfekQuestion'
import { getKierunkiWolfekRateLimitIdentity } from './getKierunkiWolfekRateLimitIdentity'
import { beginWolfekSubmission } from './beginWolfekSubmission'
import { loadWolfekQuestionData } from './loadWolfekQuestionData'
import { deliverWolfekPracticeHint } from './deliverWolfekPracticeHint'
import { validateWolfekReplay } from './validateWolfekReplay'
import type { WolfekBatchReceipt, WolfekBatchRequest } from '@/types/wolfekBatchTypes'
import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function consumeWolfekPreparedResult(
  userId: string | null, input: WolfekBatchRequest, batchId: string,
): Promise<WolfekQuestionState> {
  await authorizeWolfekQuestion(userId, input)
  const identity = await getKierunkiWolfekRateLimitIdentity(userId)
  if (!(await checkRateLimit(identity, input.route === 'kierunki' ? 'kierunki:request' : 'panel:wolfek')).success) {
    throw new WolfekQuestionError('Zbyt wiele pytań. Spróbuj ponownie za chwilę.')
  }
  const redis = getRedis()
  if (!redis) throw new WolfekQuestionError('Nie mogę sprawdzić zapisanych odpowiedzi.')
  const key = `wolfek:prepared:${identity}:${batchId}`
  const submission = await beginWolfekSubmission(`${identity}:consume:${batchId}`, input)
  if (submission.reused) { await validateWolfekReplay(userId, input, submission.reused); return submission.reused }
  const receipt = await redis.get<WolfekBatchReceipt>(key)
  const expired: WolfekQuestionState = { ...toFormState('ERROR', 'Dane uległy zmianie. Pobieram nowe odpowiedzi.'),
    answer: null, confidence: null, values: { batchInvalidated: true } }
  if (!receipt || receipt.request.visitId !== input.visitId || receipt.request.route !== input.route) return expired
  const data = await loadWolfekQuestionData(userId, input)
  if (receipt.contextVersion !== data.contextVersion) { await redis.del(key); return expired }
  const state = receipt.states[input.preparedQuestionId!]
  if (!state) throw new WolfekQuestionError('Nieprawidłowe przygotowane pytanie.')
  const result: WolfekQuestionState = { ...state, timestamp: Date.now(), values: {
    preparedQuestionId: input.preparedQuestionId, origin: 'prepared', practiceVersion: input.practice?.version ?? null,
    contextVersion: data.contextVersion, batchId, batchReused: receipt.consumed,
  } }
  if (result.answer) {
    const fresh = buildWolfekResponseRequest(input, data.pack, data.context).answers[result.answer.responseId]
    if (JSON.stringify(fresh) !== JSON.stringify(result.answer)) return expired
  }
  if (input.practice && result.answer?.action?.type === 'show_hint') {
    result.session = await deliverWolfekPracticeHint(userId!, input.practice, input.submissionId)
    await redis.del(key)
  } else {
    await redis.set(key, { ...receipt, consumed: true }, { ex: WOLFEK_BATCH_RECEIPT_SECONDS })
  }
  const source = input.route === 'kierunki' ? 'kierunki' : input.route === 'learning.practice' ? 'practice' : 'panel'
  await recordWolfekInteraction({ source, route: input.route, userId, kind: 'question', question: input.question,
    topic: result.answer?.responseId ?? null, confidence: result.confidence,
    outcome: receipt.consumed ? 'batch_reuse' : 'batch_first' })
  await recordWolfekBatchDelivery(input, userId, receipt.request.submissionId, result, receipt.consumed)
  try { await submission.complete(result) } catch {}
  return result
}
