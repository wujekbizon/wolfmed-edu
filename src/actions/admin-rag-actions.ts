'use server'

import { revalidatePath } from 'next/cache'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import {
  CreateStoreSchema,
  TestRagQuerySchema,
} from '@/server/schema'
import {
  createCorpus,
  uploadFiles,
  getCorpus,
  listCorpusFiles,
  queryFileSearchOnly,
  deleteCorpus,
  DEFAULT_EMBEDDING_MODEL,
} from '@/server/vertex-rag'
import { getRagConfig, setRagConfig, deleteRagConfig } from '@/server/rag-queries'
import { ensureAdmin } from '@/helpers/ensureAdmin'

export async function createFileSearchStoreAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await ensureAdmin()

    const displayName = formData.get('displayName') as string

    const validationResult = CreateStoreSchema.safeParse({ displayName })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    const storeName = await createCorpus(validationResult.data.displayName)

    await setRagConfig(storeName, validationResult.data.displayName, {
      embeddingModel: DEFAULT_EMBEDDING_MODEL,
    })

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

export async function uploadFilesAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await ensureAdmin()

    const config = await getRagConfig()

    if (!config) {
      return toFormState('ERROR', 'File Search Store nie jest skonfigurowany')
    }

    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return toFormState('ERROR', 'Nie wybrano żadnych plików')
    }

    const allowedTypes = ['.md', '.txt', '.pdf']
    const invalidFiles = files.filter(
      file => !allowedTypes.some(ext => file.name.endsWith(ext))
    )

    if (invalidFiles.length > 0) {
      return toFormState(
        'ERROR',
        `Nieprawidłowe typy plików: ${invalidFiles.map(f => f.name).join(', ')}`
      )
    }

    const results = await uploadFiles(config.storeName, files)

    revalidatePath('/admin/rag')

    if (results.success) {
      return toFormState(
        'SUCCESS',
        `Przesłano ${results.uploaded.length} plików pomyślnie`
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
    await ensureAdmin()

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

    await getCorpus(config.storeName)

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

export async function listStoreDocumentsAction(): Promise<{
  success: boolean
  data?: Array<{ name: string; displayName: string }>
  error?: string
}> {
  try {
    await ensureAdmin()

    const config = await getRagConfig()

    if (!config) {
      return {
        success: false,
        error: 'File Search Store nie jest skonfigurowany',
      }
    }

    const documents = await listCorpusFiles(config.storeName)

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

export async function testRagQueryAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await ensureAdmin()

    const question = formData.get('question') as string
    const storeName = (formData.get('storeName') as string) || undefined

    const validationResult = TestRagQuerySchema.safeParse({
      question,
      storeName,
    })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Same path production uses, so a green admin probe means the tutor works.
    const result = await queryFileSearchOnly(validationResult.data.question, {
      ...(validationResult.data.storeName ? { storeName: validationResult.data.storeName } : {}),
    })

    return {
      ...toFormState('SUCCESS', result.answer),
      values: { sources: result.sources }
    }
  } catch (error) {
    console.error('Error testing RAG query:', error)
    return fromErrorToFormState(error)
  }
}

export async function deleteFileSearchStoreAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await ensureAdmin()

    const config = await getRagConfig()

    if (!config) {
      return toFormState('ERROR', 'File Search Store nie jest skonfigurowany')
    }

    await deleteCorpus(config.storeName)

    await deleteRagConfig(config.storeName)

    revalidatePath('/admin/rag')

    return toFormState('SUCCESS', 'File Search Store usunięty pomyślnie')
  } catch (error) {
    console.error('Error deleting file search store:', error)
    return fromErrorToFormState(error)
  }
}
