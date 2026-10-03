'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { WolfekBatchIdSchema, WolfekVisitIdSchema } from '@/server/schema'
import { resolveWolfekQuestionInput } from '@/helpers/resolveWolfekQuestionInput'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { loadWolfekPreparedBatch } from '@/server/companion/loadWolfekPreparedBatch'
import { consumeWolfekPreparedResult } from '@/server/companion/consumeWolfekPreparedResult'
import type { WolfekBatchState } from '@/types/wolfekBatchTypes'
import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function getWolfekPreparedBatchAction(data: FormData): Promise<WolfekBatchState> {
  const { userId } = await auth()
  try {
    return await loadWolfekPreparedBatch(userId, { ...resolveWolfekQuestionInput(data),
      visitId: WolfekVisitIdSchema.parse(data.get('visitId')) })
  } catch (error) {
    return { ...(error instanceof z.ZodError ? fromErrorToFormState(error) : toFormState('ERROR',
      error instanceof WolfekQuestionError ? error.message : 'Nie mogę pobrać przygotowanych odpowiedzi.')), batch: null }
  }
}

export async function useWolfekPreparedResultAction(data: FormData): Promise<WolfekQuestionState> {
  const { userId } = await auth()
  try {
    return await consumeWolfekPreparedResult(userId, { ...resolveWolfekQuestionInput(data),
      visitId: WolfekVisitIdSchema.parse(data.get('visitId')) }, WolfekBatchIdSchema.parse(data.get('batchId')))
  } catch (error) {
    return { ...(error instanceof z.ZodError ? fromErrorToFormState(error) : toFormState('ERROR',
      error instanceof WolfekQuestionError ? error.message : 'Nie mogę sprawdzić zapisanej odpowiedzi.')),
      answer: null, confidence: null }
  }
}
