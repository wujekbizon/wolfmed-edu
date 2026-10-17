'use server'

import { randomUUID } from 'node:crypto'
import { after } from 'next/server'
import { z } from 'zod'
import { requireCategoryAccess } from '@/server/learning/requireCategoryAccess'
import { isPracticeEnabled } from '@/server/learning/config'
import { readPracticeSession } from '@/server/learning/readSession'
import { startPracticeSession } from '@/server/learning/startSession'
import { mutatePracticeSession } from '@/server/learning/mutateSession'
import { PracticeCategorySchema, PracticeMutationSchema, PracticeStartSchema } from '@/server/schema'
import { checkRateLimit } from '@/lib/rateLimit'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import type { PracticeFormState } from '@/types/learningPracticeTypes'
import { PracticeError } from '@/server/learning/PracticeError'
import { PracticeConflictError } from '@/server/learning/PracticeConflictError'
import { onPracticeActivity } from '@/server/memory/extractPractice'

export async function getPracticeAction(category: string) {
  const validated = PracticeCategorySchema.parse(category)
  const userId = await requireCategoryAccess(validated)
  if (!isPracticeEnabled(validated)) throw new Error('Ćwiczenia są obecnie niedostępne.')
  return readPracticeSession(userId, validated)
}

export async function practiceAction(previous: PracticeFormState, formData: FormData): Promise<PracticeFormState> {
  try {
    const category = PracticeCategorySchema.parse(formData.get('category'))
    const userId = await requireCategoryAccess(category)
    if (!isPracticeEnabled(category)) throw new PracticeError('Ćwiczenia są obecnie niedostępne.')
    const rate = await checkRateLimit(userId, 'practice:write')
    if (!rate.success) throw new PracticeError('Zbyt wiele prób. Spróbuj później.')
    const command = formData.get('command')
    let session
    if (command === 'start' || command === 'repeat') {
      session = await startPracticeSession(userId, category, PracticeStartSchema.parse(formData.get('eventId')),
        command === 'repeat' ? PracticeStartSchema.parse(formData.get('sessionId')) : undefined)
    } else {
      const input = PracticeMutationSchema.parse({
        sessionId: formData.get('sessionId'), eventId: formData.get('eventId'),
        version: formData.get('version'), command, questionId: formData.get('questionId'),
        selected: formData.get('selected'),
      })
      let sessionId = input.sessionId
      let version = input.version
      const bootstrapped = !sessionId
      if (!sessionId) {
        const deck = await startPracticeSession(userId, category, randomUUID())
        sessionId = deck.id
        version = deck.version
      }
      session = await mutatePracticeSession(userId, category, { ...input, sessionId, version })
      if (bootstrapped) session = await readPracticeSession(userId, category) ?? session
      if (['answer', 'hint', 'reveal'].includes(input.command)) {
        after(async () => { await onPracticeActivity(userId, category) })
      }
    }
    return { ...toFormState('SUCCESS', ''), session }
  } catch (error) {
    if (error instanceof PracticeConflictError) return { ...toFormState('ERROR', error.message), session: error.session }
    if (error instanceof z.ZodError) return { ...fromErrorToFormState(error), session: previous.session }
    if (error instanceof PracticeError) return { ...toFormState('ERROR', error.message), session: previous.session }
    console.error('[practice] Action failed', error)
    return {
      ...toFormState('ERROR', 'Nie udało się zapisać postępu. Sprawdź dostęp i połączenie, a potem ponów próbę.'),
      session: previous.session,
    }
  }
}
