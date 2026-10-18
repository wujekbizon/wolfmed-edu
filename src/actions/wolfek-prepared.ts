'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { resolveWolfekQuestionInput } from '@/helpers/resolveWolfekQuestionInput'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { PracticeConflictError } from '@/server/learning/PracticeConflictError'
import { executeWolfekPreparedQuestion } from '@/server/companion/executeWolfekPreparedQuestion'
import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function answerWolfekPreparedQuestionAction(data: FormData): Promise<WolfekQuestionState> {
  const { userId } = await auth()
  try {
    return await executeWolfekPreparedQuestion(userId, resolveWolfekQuestionInput(data))
  } catch (error) {
    return { ...(error instanceof z.ZodError ? fromErrorToFormState(error) : toFormState('ERROR',
      error instanceof WolfekQuestionError || error instanceof PracticeConflictError
        ? error.message : 'Nie mogę teraz przygotować odpowiedzi.')),
      answer: null, confidence: null, ...(error instanceof PracticeConflictError ? { session: error.session } : {}) }
  }
}
