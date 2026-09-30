'use server'

import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { KierunkiWolfekAskSchema, KierunkiWolfekTopicSchema } from '@/server/schema'
import { getKierunkiWolfekContext } from '@/server/companion/getKierunkiWolfekContext'
import { checkKierunkiWolfekRateLimit } from '@/server/companion/checkKierunkiWolfekRateLimit'
import { getKierunkiWolfekAnswer } from '@/server/companion/getKierunkiWolfekAnswer'
import { selectKierunkiWolfekTopic } from '@/server/companion/selectKierunkiWolfekTopic'
import type { KierunkiWolfekAskState } from '@/types/kierunkiWolfekTypes'
import { recordWolfekInteraction } from '@/server/jev/recordWolfekInteraction'
import { WOLFEK_TOPIC_MIN_CONFIDENCE } from '@/constants/wolfekRouting'

export async function getKierunkiWolfekTopicAction(input: unknown) {
  const { userId } = await auth()
  const topic = KierunkiWolfekTopicSchema.safeParse(input)
  if (!topic.success || !(await checkKierunkiWolfekRateLimit(userId)).success) return null
  const context = await getKierunkiWolfekContext(userId)
  await recordWolfekInteraction({ source: 'kierunki', route: 'kierunki', userId, kind: 'topic_click',
    question: null, topic: topic.data, confidence: null, outcome: 'topic_click' })
  return getKierunkiWolfekAnswer(topic.data, context)
}

export async function askKierunkiWolfekAction(
  _previous: KierunkiWolfekAskState, formData: FormData,
): Promise<KierunkiWolfekAskState> {
  const { userId } = await auth()
  const parsed = KierunkiWolfekAskSchema.safeParse({ question: formData.get('question') })
  if (!parsed.success) return fromErrorToFormState(parsed.error)
  try {
    const rate = await checkKierunkiWolfekRateLimit(userId)
    if (!rate.success) return toFormState('ERROR', 'Na chwilę zwalniamy tempo. Spróbuj ponownie za moment.')
    const context = await getKierunkiWolfekContext(userId)
    const decision = await selectKierunkiWolfekTopic(userId, parsed.data.question, context)
    await recordWolfekInteraction({ source: 'kierunki', route: 'kierunki', userId, kind: 'question',
      question: parsed.data.question, topic: decision?.topic ?? null, confidence: decision?.confidence ?? null,
      outcome: decision ? decision.cacheHit ? 'cache_hit' : 'provider' : 'unavailable' })
    if (!decision || decision.topic === 'other' || decision.confidence < WOLFEK_TOPIC_MIN_CONFIDENCE) {
      return { ...toFormState('SUCCESS', ''), answer: null, confidence: decision?.confidence ?? null }
    }
    return { ...toFormState('SUCCESS', ''), answer: getKierunkiWolfekAnswer(decision.topic, context), confidence: decision.confidence }
  } catch {
    return toFormState('ERROR', 'Nie mogę teraz odpowiedzieć. Wybierz temat albo spróbuj później.')
  }
}
