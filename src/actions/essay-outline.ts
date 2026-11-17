'use server'

import { EssayBriefSchema } from '@/server/schema'
import { requireEssayAccess } from '@/server/essays/requireEssayAccess'
import { prepareEssayOutline } from '@/server/essays/prepareEssayOutline'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import type { FormState } from '@/types/actionTypes'

export async function prepareEssayOutlineAction(_state: FormState, data: FormData): Promise<FormState> {
  try {
    const userId = await requireEssayAccess()
    const brief = EssayBriefSchema.parse(JSON.parse(String(data.get('brief') ?? '{}')))
    await requireEssayAccess(brief.course, 'essay:outline')
    const result = await prepareEssayOutline(userId, brief)
    return { ...toFormState('SUCCESS', ''), values: { result: JSON.stringify(result), input: String(data.get('input') ?? '') } }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
