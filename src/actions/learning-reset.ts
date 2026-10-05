'use server'

import { z } from 'zod'
import { PracticeResetSchema } from '@/server/schema'
import { requireCategoryAccess } from '@/server/learning/requireCategoryAccess'
import { isPracticeEnabled } from '@/server/learning/config'
import { resetPracticeSession } from '@/server/learning/resetSession'
import { checkRateLimit } from '@/lib/rateLimit'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { PracticeError } from '@/server/learning/PracticeError'
import type { PracticeFormState } from '@/types/learningPracticeTypes'

export async function resetPracticeAction(previous: PracticeFormState, formData: FormData): Promise<PracticeFormState> {
  try {
    const parsed = PracticeResetSchema.safeParse({
      category: formData.get('category'), sessionId: formData.get('sessionId'),
      eventId: formData.get('eventId'), version: formData.get('version'),
    })
    if (!parsed.success) return { ...fromErrorToFormState(parsed.error), session: previous.session }
    const userId = await requireCategoryAccess(parsed.data.category)
    if (!isPracticeEnabled(parsed.data.category)) throw new PracticeError('Ćwiczenia są obecnie niedostępne.')
    if (!(await checkRateLimit(userId, 'practice:write')).success) {
      throw new PracticeError('Zbyt wiele prób. Spróbuj później.')
    }
    const session = await resetPracticeSession(userId, parsed.data)
    return { ...toFormState('SUCCESS', ''), session }
  } catch (error) {
    if (error instanceof z.ZodError) return { ...fromErrorToFormState(error), session: previous.session }
    if (error instanceof PracticeError) return { ...toFormState('ERROR', error.message), session: previous.session }
    console.error('[practice] Reset failed', error)
    return { ...toFormState('ERROR', 'Nie udało się wyczyścić postępu.'), session: previous.session }
  }
}

