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
  deleteFileSearchStore,
} from '@/lib/google-rag'
import { getRagConfig, setRagConfig, deleteRagConfig } from '@/server/rag-queries'

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

    // Save to database
    await setRagConfig(storeName, validationResult.data.displayName)

    revalidatePath('/admin/rag')

    return {
      ...toFormState('SUCCESS', 'File Search Store utworzony pomyślnie'),
      values: { storeName }
    }
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

    // Get store name from database
    const config = await getRagConfig()

    if (!config) {
      return toFormState('ERROR', 'File Search Store nie jest skonfigurowany')
    }

    // Upload documents
    const results = await uploadMedicalDocuments(config.storeName)

    revalidatePath('/admin/rag')

    if (results.success) {
      return toFormState(
        'SUCCESS',
        `Przesłano ${results.uploaded.length} dokumentów pomyślnie`
      )
    } else {
      return toFormState(
        'ERROR',
        `Przesłano ${results.uploaded.length} dokumentów. Błędy: ${results.failed.length}`
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
    storeDisplayName?: string | undefined
    isConfigured: boolean
  }
  error?: string
}> {
  try {
    // Check admin authentication
    await requireAdminAction()

    // Get store name from database
    const config = await getRagConfig()

    if (!config) {
      return {
        success: true,
        data: {
          storeName: null,
          isConfigured: false,
        },
      }
    }

    // Get store information from Google
    const storeInfo = await getStoreInfo(config.storeName)

    return {
      success: true,
      data: {
        storeName: config.storeName,
        storeDisplayName: config.storeDisplayName ?? undefined,
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

    // Get store name from database
    const config = await getRagConfig()

    if (!config) {
      return {
        success: false,
        error: 'File Search Store nie jest skonfigurowany',
      }
    }

    // List documents
    const documents = await listStoreDocuments(config.storeName)

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

    return {
      ...toFormState('SUCCESS', result.answer),
      values: { sources: result.sources }
    }
  } catch (error) {
    console.error('Error testing RAG query:', error)
    return fromErrorToFormState(error)
  }
}

/**
 * Delete File Search Store and its configuration
 * Admin only - Rate limited to 3 per hour
 */
export async function deleteFileSearchStoreAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check admin authentication
    const admin = await requireAdminAction()

    // Rate limiting
    const rateLimit = await checkRateLimit(admin.userId, 'rag:admin:delete-store')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toFormState(
        'ERROR',
        `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
      )
    }

    // Get store name from database
    const config = await getRagConfig()

    if (!config) {
      return toFormState('ERROR', 'File Search Store nie jest skonfigurowany')
    }

    // Delete from Google
    await deleteFileSearchStore(config.storeName)

    // Delete from database
    await deleteRagConfig()

    revalidatePath('/admin/rag')

    return toFormState('SUCCESS', 'File Search Store usunięty pomyślnie')
  } catch (error) {
    console.error('Error deleting file search store:', error)
    return fromErrorToFormState(error)
  }
}
