import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import 'server-only'
import { createHash } from 'node:crypto'
import { getRedis } from '@/lib/redis'
import { WOLFEK_RESPONSE_RETRY_SECONDS } from '@/constants/wolfekResponses'
import type { WolfekQuestionRequest, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function beginWolfekSubmission<T = WolfekQuestionState>(identity: string, input: WolfekQuestionRequest) {
  const redis = getRedis()
  if (!redis) throw new WolfekQuestionError('Nie mogę teraz połączyć się z usługą pytań. Spróbuj później.')
  const key = `wolfek:submission:${identity}:${input.submissionId}`
  const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex')
  const stored = await redis.get<{ hash: string; result?: T }>(key)
  if (stored) {
    if (stored.hash !== hash) throw new WolfekQuestionError('Identyfikator pytania jest już używany.')
    if (!stored.result) throw new WolfekQuestionError('To pytanie jest już przetwarzane. Poczekaj chwilę.')
    return { reused: stored.result, complete: async (_result: T) => {} }
  }
  if (!await redis.set(key, { hash }, { nx: true, ex: WOLFEK_RESPONSE_RETRY_SECONDS })) {
    throw new WolfekQuestionError('To pytanie jest już przetwarzane. Poczekaj chwilę.')
  }
  return { reused: null, complete: async (result: T) => {
    await redis.set(key, { hash, result }, { ex: WOLFEK_RESPONSE_RETRY_SECONDS })
  } }
}
