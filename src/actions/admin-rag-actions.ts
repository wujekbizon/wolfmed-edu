'use server'

/**
 * Admin-only server actions for RAG File Search Store management
 * Requires admin authentication for all operations
 */

import { revalidatePath } from 'next/cache'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { requireAdminAction } from '@/lib/adminHelpers'
import { checkRateLimit } from '@/lib/rateLimit'
import {
  CreateStoreSchema,
  TestRagQuerySchema,
} from '@/server/schema'
import {
  createFileSearchStore,
  uploadMedicalDocuments,
  getStoreInfo,
  listStoreDocuments,
  queryWithFileSearch,
} from '@/lib/google-rag'

/**
 * Create a new File Search Store
 * Admin only - Rate limited to 5 per hour
 */
export async function createFileSearchStoreAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check admin authentication
    const admin = await requireAdminAction()

    // Rate limiting
    const rateLimit = await checkRateLimit(admin.userId, 'rag:admin:create-store')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toFormState(
        'ERROR',
        `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
      )
    }

    // Validate input
    const displayName = formData.get('displayName') as string

    const validationResult = CreateStoreSchema.safeParse({ displayName })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Create the store
    const storeName = await createFileSearchStore(validationResult.data.displayName)

    revalidatePath('/admin/rag')

    return toFormState('SUCCESS', 'File Search Store utworzony pomyślnie', {
      storeName,
    })
  } catch (error) {
    console.error('Error creating file search store:', error)
    return fromErrorToFormState(error)
  }
}

/**
 * Upload all medical documents to the File Search Store
 * Admin only - Rate limited to 3 per hour
 */
export async function uploadMedicalDocsAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check admin authentication
    const admin = await requireAdminAction()

    // Rate limiting
    const rateLimit = await checkRateLimit(admin.userId, 'rag:admin:upload')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toFormState(
        'ERROR',
        `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
      )
    }

    // Get store name from form data
    const storeName = formData.get('storeName') as string

    if (!storeName) {
      return toFormState('ERROR', 'Brak nazwy File Search Store')
    }

    // Upload documents
    const results = await uploadMedicalDocuments(storeName)

    revalidatePath('/admin/rag')

    if (results.success) {
      return toFormState(
        'SUCCESS',
        `Przesłano ${results.uploaded.length} dokumentów pomyślnie`,
        {
          uploaded: results.uploaded,
          failed: results.failed,
        }
      )
    } else {
      return toFormState(
        'ERROR',
        `Przesłano ${results.uploaded.length} dokumentów. Błędy: ${results.failed.length}`,
        {
          uploaded: results.uploaded,
          failed: results.failed,
        }
      )
    }
  } catch (error) {
    console.error('Error uploading medical documents:', error)
    return fromErrorToFormState(error)
  }
}

/**
 * Get File Search Store status and information
 * Admin only - No rate limit (read-only operation)
 */
export async function getStoreStatusAction(): Promise<{
  success: boolean
  data?: {
    storeName: string | null
    storeDisplayName?: string
    isConfigured: boolean
  }
  error?: string
}> {
  try {
    // Check admin authentication
    await requireAdminAction()

    const storeName = process.env.GOOGLE_FILE_SEARCH_STORE_NAME

    if (!storeName) {
      return {
        success: true,
        data: {
          storeName: null,
          isConfigured: false,
        },
      }
    }

    // Get store information
    const storeInfo = await getStoreInfo(storeName)

    return {
      success: true,
      data: {
        storeName: storeInfo.name,
        storeDisplayName: storeInfo.displayName,
        isConfigured: true,
      },
    }
  } catch (error) {
    console.error('Error getting store status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Wystąpił błąd',
    }
  }
}

/**
 * List all documents in the File Search Store
 * Admin only - No rate limit (read-only operation)
 */
export async function listStoreDocumentsAction(): Promise<{
  success: boolean
  data?: Array<{ name: string; displayName: string }>
  error?: string
}> {
  try {
    // Check admin authentication
    await requireAdminAction()

    const storeName = process.env.GOOGLE_FILE_SEARCH_STORE_NAME

    if (!storeName) {
      return {
        success: false,
        error: 'File Search Store nie jest skonfigurowany',
      }
    }

    // List documents
    const documents = await listStoreDocuments(storeName)

    return {
      success: true,
      data: documents,
    }
  } catch (error) {
    console.error('Error listing store documents:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Wystąpił błąd',
    }
  }
}

/**
 * Test RAG query against the File Search Store
 * Admin only - Rate limited to 20 per hour
 */
export async function testRagQueryAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check admin authentication
    const admin = await requireAdminAction()

    // Rate limiting
    const rateLimit = await checkRateLimit(admin.userId, 'rag:admin:test')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toFormState(
        'ERROR',
        `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
      )
    }

    // Validate input
    const question = formData.get('question') as string
    const storeName = (formData.get('storeName') as string) || undefined

    const validationResult = TestRagQuerySchema.safeParse({
      question,
      storeName,
    })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Query RAG system
    const result = await queryWithFileSearch(
      validationResult.data.question,
      validationResult.data.storeName
    )

    return toFormState('SUCCESS', 'Zapytanie wykonane pomyślnie', {
      answer: result.answer,
      sources: result.sources,
    })
  } catch (error) {
    console.error('Error testing RAG query:', error)
    return fromErrorToFormState(error)
  }
}
