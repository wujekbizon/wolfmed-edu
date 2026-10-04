import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import 'server-only'
import { after } from 'next/server'
import { randomUUID } from 'node:crypto'
import { mutatePracticeSession } from '@/server/learning/mutateSession'
import { startPracticeSession } from '@/server/learning/startSession'
import { onPracticeActivity } from '@/server/memory/extractPractice'
import type { WolfekPracticeReference } from '@/types/wolfekResponseTypes'

export async function deliverWolfekPracticeHint(userId: string, ref: WolfekPracticeReference, eventId: string) {
  const started = !ref.sessionId ? await startPracticeSession(userId, ref.category, randomUUID()) : null
  const view = await mutatePracticeSession(userId, ref.category, {
    sessionId: ref.sessionId ?? started!.id, version: started?.version ?? ref.version,
    questionId: ref.questionId, command: 'hint', eventId,
  })
  if (view.question?.id !== ref.questionId || !view.question.hintOpened) {
    throw new WolfekQuestionError('Karta uległa zmianie. Nie udało się zapisać użycia wskazówki.')
  }
  after(async () => { await onPracticeActivity(userId, ref.category) })
  return view
}
