'use server'

import { EssayGenerationSchema } from '@/server/schema'
import { requireEssayAccess } from '@/server/essays/requireEssayAccess'
import { writeEssay } from '@/server/essays/writeEssay'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import type { FormState } from '@/types/actionTypes'

export async function generateEssayAction(_state: FormState, data: FormData): Promise<FormState> {
  try {
    const userId = await requireEssayAccess()
    const draft = EssayGenerationSchema.parse(JSON.parse(String(data.get('draft') ?? '{}')))
    await requireEssayAccess(draft.brief.course, 'essay:generate')
    const result = await writeEssay(userId, draft)
    return { ...toFormState('SUCCESS', ''), values: { result: JSON.stringify(result), input: String(data.get('input') ?? '') } }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
