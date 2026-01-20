'use server'

/**
 * User-facing RAG server actions
 * Requires user authentication
 */

import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { checkRateLimit } from '@/lib/rateLimit'
import { RagQuerySchema } from '@/server/schema'
import { queryWithFileSearch } from '@/lib/google-rag'

/**
 * Ask a question to the RAG system
 * User-facing - Rate limited to 10 per hour
 */
export async function askRagQuestion(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check user authentication
    const { userId } = await auth()
    if (!userId) {
      return toFormState('ERROR', 'Musisz być zalogowany')
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(userId, 'rag:query')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toFormState(
        'ERROR',
        `Zbyt wiele zapytań. Spróbuj ponownie za ${resetMinutes} minut.`
      )
    }

    // Validate input
    const question = formData.get('question') as string
    const cellId = formData.get('cellId') as string

    const validationResult = RagQuerySchema.safeParse({
      question,
      cellId,
    })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Check if store is configured
    const storeName = process.env.GOOGLE_FILE_SEARCH_STORE_NAME
    if (!storeName) {
      return toFormState(
        'ERROR',
        'System RAG nie jest skonfigurowany. Skontaktuj się z administratorem.'
      )
    }

    // Query RAG system
    const result = await queryWithFileSearch(
      validationResult.data.question,
      storeName
    )

    return {
      ...toFormState('SUCCESS', result.answer),
      values: { sources: result.sources }
    }
  } catch (error) {
    console.error('Error querying RAG:', error)
    return fromErrorToFormState(error)
  }
}
