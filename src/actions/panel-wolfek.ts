'use server'

import { auth } from '@clerk/nextjs/server'
import { PANEL_WOLFEK_ONBOARDING_PREFIX } from '@/constants/panelWolfek'
import { getRedis } from '@/lib/redis'
import { getUserEnrolledCourses } from '@/server/queries'
import { getPanelOnboardingSeen } from '@/server/companion/getPanelOnboardingSeen'
import { getPanelWolfekContext } from '@/server/companion/getPanelWolfekContext'
import { getPanelWolfekAnswer } from '@/server/companion/getPanelWolfekAnswer'
import { selectPanelWolfekTopic } from '@/server/companion/selectPanelWolfekTopic'
import { PanelWolfekAskSchema, PanelWolfekTopicSchema } from '@/server/schema'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import type { PanelWolfekAskState } from '@/types/panelWolfekTypes'

export async function getPanelOnboardingSeenAction() {
  const { userId } = await auth()
  if (!userId || !(await getUserEnrolledCourses(userId)).length) return true
  return getPanelOnboardingSeen(userId)
}

export async function markPanelOnboardingSeenAction() {
  const { userId } = await auth()
  if (!userId || !(await getUserEnrolledCourses(userId)).length) return false
  const redis = getRedis()
  if (!redis) return false
  try {
    await redis.set(`${PANEL_WOLFEK_ONBOARDING_PREFIX}${userId}`, '1', { ex: 365 * 24 * 60 * 60 })
    return true
  } catch {
    return false
  }
}

export async function getPanelWolfekTopicAction(input: unknown) {
  const { userId } = await auth()
  if (!userId) return null
  const parsed = PanelWolfekTopicSchema.safeParse(input)
  if (!parsed.success) return null
  const context = await getPanelWolfekContext(userId)
  if (!context) return null
  return getPanelWolfekAnswer(userId, parsed.data, context)
}

export async function askPanelWolfekAction(
  _previous: PanelWolfekAskState, formData: FormData,
): Promise<PanelWolfekAskState> {
  const { userId } = await auth()
  if (!userId) return toFormState('ERROR', 'Zaloguj się ponownie.')
  const parsed = PanelWolfekAskSchema.safeParse({ question: formData.get('question') })
  if (!parsed.success) return fromErrorToFormState(parsed.error)
  try {
    const context = await getPanelWolfekContext(userId)
    if (!context) return toFormState('ERROR', 'Brak dostępu do panelu.')
    const decision = await selectPanelWolfekTopic(userId, parsed.data.question, context)
    if (!decision || decision.topic === 'other' || decision.confidence < 0.35) {
      return { ...toFormState('SUCCESS', ''), answer: null, confidence: decision?.confidence ?? null }
    }
    const answer = await getPanelWolfekAnswer(userId, decision.topic, context)
    return { ...toFormState('SUCCESS', ''), answer, confidence: decision.confidence }
  } catch {
    return toFormState('ERROR', 'Nie mogę teraz sprawdzić odpowiedzi. Wybierz temat poniżej.')
  }
}
