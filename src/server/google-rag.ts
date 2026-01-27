import 'server-only'
import { GoogleGenAI } from '@google/genai'
import { SYSTEM_PROMPT, enhanceUserQuery } from '../helpers/rag-prompts'
import { getRagConfig } from '@/server/rag-queries'

function getGoogleAI() {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured')
  }
  return new GoogleGenAI({ apiKey })
}

export async function createFileSearchStore(
  displayName: string
): Promise<string> {
  try {
    const ai = getGoogleAI()

    const store = await ai.fileSearchStores.create({
      config: { displayName }
    })

    if (!store.name) {
      throw new Error('Failed to create file search store: No store name returned')
    }

    return store.name
  } catch (error) {
    console.error('Error creating file search store:', error)
    throw new Error('Nie można utworzyć File Search Store')
  }
}

export async function deleteFileSearchStore(
  storeName: string
): Promise<void> {
  try {
    const ai = getGoogleAI()

    await ai.fileSearchStores.delete({ name: storeName })
  } catch (error) {
    console.error('Error deleting file search store:', error)
    throw new Error('Nie można usunąć File Search Store')
  }
}

export async function uploadFiles(
  storeName: string,
  files: File[]
): Promise<{ success: boolean; uploaded: string[]; failed: string[] }> {
  const results = {
    success: true,
    uploaded: [] as string[],
    failed: [] as string[]
  }

  try {
    const ai = getGoogleAI()

    if (files.length === 0) {
      throw new Error('No files provided for upload')
    }

    for (const file of files) {
      try {
        let mimeType = file.type
        if (!mimeType) {
          if (file.name.endsWith('.md')) mimeType = 'text/markdown'
          else if (file.name.endsWith('.txt')) mimeType = 'text/plain'
          else if (file.name.endsWith('.pdf')) mimeType = 'application/pdf'
          else mimeType = 'application/octet-stream'
        }

        let operation = await ai.fileSearchStores.uploadToFileSearchStore({
          file: file,
          fileSearchStoreName: storeName,
          config: {
            displayName: file.name,
            mimeType
          }
        })

        let attempts = 0
        const maxAttempts = 60

        while (!operation.done && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000))
          operation = await ai.operations.get({ operation })
          attempts++
        }

        if (!operation.done) {
          throw new Error(`Upload timed out after ${maxAttempts * 5} seconds`)
        }

        if (operation.error) {
          throw new Error(`Upload failed: ${operation.error.message || 'Unknown error'}`)
        }

        results.uploaded.push(file.name)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        results.failed.push(file.name)
        results.success = false
      }
    }

    return results
  } catch (error) {
    console.error('Error uploading files:', error)
    throw new Error('Nie można przesłać plików')
  }
}

export async function queryWithFileSearch(
  question: string,
  storeName?: string,
  additionalContext?: string,
  tools?: Array<{ name: string; description: string; parameters: any }>
): Promise<{ answer: string; sources?: string[]; toolResults?: any }> {
  try {
    const ai = getGoogleAI()

    let fileSearchStoreName = storeName

    if (!fileSearchStoreName) {
      const config = await getRagConfig()
      fileSearchStoreName = config?.storeName
    }

    if (!fileSearchStoreName) {
      throw new Error('File Search Store nie jest skonfigurowany')
    }

    const finalQuestion = additionalContext
      ? `${additionalContext}\n\n${question}`
      : question

    console.log('[RAG] Preparing query:', {
      hasAdditionalContext: !!additionalContext,
      additionalContextLength: additionalContext?.length || 0,
      questionLength: question.length,
      finalQuestionLength: finalQuestion.length
    })

    const enhancedQuery = enhanceUserQuery(finalQuestion)

    const configTools: any[] = [{
      fileSearch: {
        fileSearchStoreNames: [fileSearchStoreName]
      }
    }]

    if (tools && tools.length > 0) {
      configTools.push({
        functionDeclarations: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }))
      })
    }

    console.log('[RAG] Calling Gemini with:', {
      model: 'gemini-2.5-flash',
      hasTools: !!tools,
      toolsCount: tools?.length || 0,
      configToolsCount: configTools.length
    })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: enhancedQuery,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: configTools
      }
    })

    console.log('[RAG] Gemini response received:', {
      hasText: !!response.text,
      textLength: response.text?.length || 0,
      hasFunctionCalls: !!response.functionCalls,
      candidates: response.candidates?.length || 0,
      finishReason: response.candidates?.[0]?.finishReason,
      firstCandidate: response.candidates?.[0] ? JSON.stringify(response.candidates[0], null, 2) : 'none'
    })

    const answer = response.text || ''

    if (!answer) {
      throw new Error('Empty response from Gemini')
    }

    let toolResults: any = undefined

    if (response.functionCalls && Array.isArray(response.functionCalls)) {
      const results: Record<string, any> = {}
      for (const call of response.functionCalls) {
        if (call.name) {
          results[call.name] = call.args
        }
      }
      if (Object.keys(results).length > 0) {
        toolResults = results
      }
    }

    return {
      answer,
      sources: [],
      toolResults
    }
  } catch (error) {
    console.error('Error querying with file search:', error)

    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        throw error
      }
      if (error.message.includes('Empty response')) {
        throw new Error('Nie znalazłem odpowiedzi w dokumentach')
      }
    }

    throw new Error('Wystąpił błąd podczas wyszukiwania odpowiedzi')
  }
}

export async function getStoreInfo(storeName: string): Promise<{
  name: string
  displayName?: string | undefined
}> {
  try {
    const ai = getGoogleAI()

    const store = await ai.fileSearchStores.get({ name: storeName })

    return {
      name: store.name || storeName,
      displayName: store.displayName ?? undefined
    }
  } catch (error) {
    console.error('Error getting store info:', error)
    throw new Error('Nie można pobrać informacji o File Search Store')
  }
}

export async function listStoreDocuments(storeName: string): Promise<
  Array<{
    name: string
    displayName: string
  }>
> {
  try {
    const ai = getGoogleAI()

    const response = await ai.fileSearchStores.documents.list({
      parent: storeName
    })

    const documents: any[] = []
    for await (const doc of response) {
      documents.push(doc)
    }

    return documents.map((doc: any) => ({
      name: doc.name || '',
      displayName: doc.displayName || doc.name || 'Unknown'
    }))
  } catch (error) {
    console.error('Error listing store documents:', error)
    throw new Error('Nie można pobrać listy dokumentów')
  }
}
