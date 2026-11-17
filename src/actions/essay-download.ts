'use server'

import { EssayDownloadSchema } from '@/server/schema'
import { requireEssayAccess } from '@/server/essays/requireEssayAccess'
import { renderEssayPdf } from '@/server/essays/pdf/renderEssayPdf'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import type { FormState } from '@/types/actionTypes'

export async function downloadEssayPdfAction(_state: FormState, data: FormData): Promise<FormState> {
  try {
    await requireEssayAccess(undefined, 'essay:download')
    const input = EssayDownloadSchema.parse(JSON.parse(String(data.get('document') ?? '{}')))
    const pdf = await renderEssayPdf(input.topic, input.editorContent, input.sources)
    return { ...toFormState('SUCCESS', ''), values: { pdf } }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
