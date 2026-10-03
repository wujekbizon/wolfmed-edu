'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { resolveWolfekQuestionInput } from '@/helpers/resolveWolfekQuestionInput'
import { executeWolfekQuestion } from '@/server/companion/executeWolfekQuestion'
import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function askWolfekQuestionAction(_previous: WolfekQuestionState, data: FormData): Promise<WolfekQuestionState> {
  const { userId } = await auth()
  try {
    return await executeWolfekQuestion(userId, resolveWolfekQuestionInput(data))
  } catch (error) {
    return { ...(error instanceof z.ZodError ? fromErrorToFormState(error) : toFormState('ERROR',
      error instanceof WolfekQuestionError ? error.message : 'Nie mogę teraz odpowiedzieć. Spróbuj później.')),
      answer: null, confidence: null }
  }
}
