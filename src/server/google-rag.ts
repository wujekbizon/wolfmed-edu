import 'server-only'
import { GoogleGenAI } from '@google/genai'
import { SYSTEM_PROMPT, enhanceUserQuery } from '../helpers/rag-prompts'
import { getRagConfig } from '@/server/rag-queries'
import { executeToolLocally, type ToolResult } from './tools/executor'

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: enhancedQuery,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: configTools
      }
    })

    if (response.functionCalls && Array.isArray(response.functionCalls) && response.functionCalls.length > 0) {
      console.log('[RAG] Gemini requested tool execution:', response.functionCalls.map(c => c.name))

      const executedTools: Array<{ name: string; result: ToolResult }> = []

      for (const call of response.functionCalls) {
        if (call.name) {
          try {
            const result = await executeToolLocally(call.name, call.args || {})
            executedTools.push({ name: call.name, result })
          } catch (error) {
            console.error(`Failed to execute tool ${call.name}:`, error)
            executedTools.push({
              name: call.name,
              result: {
                content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: { error: true }
              }
            })
          }
        }
      }

      const functionResponseParts = executedTools.map(({ name, result }) => ({
        functionResponse: {
          name,
          response: result
        }
      }))

      console.log('[RAG] Sending tool results back to Gemini for final answer')

      const toolResultsText = executedTools.map(({ name, result }) => {
        return `Tool: ${name}\nResult: ${JSON.stringify(result, null, 2)}`
      }).join('\n\n')

      const finalPrompt = `${enhancedQuery}

TOOL EXECUTION RESULTS:
${toolResultsText}

Based on the tool execution results above, please provide a comprehensive final answer incorporating the generated content.`

      const finalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT
        }
      })

      const finalAnswer = finalResponse.text || ''

      if (!finalAnswer) {
        throw new Error('Empty response from Gemini after tool execution')
      }

      const toolResultsFormatted: Record<string, ToolResult> = {}
      executedTools.forEach(({ name, result }) => {
        toolResultsFormatted[name] = result
      })

      console.log('[RAG] Returning toolResults:', JSON.stringify(toolResultsFormatted, null, 2))

      return {
        answer: finalAnswer,
        sources: [],
        toolResults: toolResultsFormatted
      }
    }

    const answer = response.text || ''

    if (!answer) {
      throw new Error('Empty response from Gemini')
    }

    return {
      answer,
      sources: [],
      toolResults: undefined
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

export async function queryFileSearchOnly(
  question: string,
  storeName?: string,
  additionalContext?: string
): Promise<{ answer: string; sources?: string[] }> {
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

    const enhancedQuery = enhanceUserQuery(finalQuestion)

    console.log('[RAG] Phase 1: RAG-only query (no tools)')

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: enhancedQuery,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{
          fileSearch: {
            fileSearchStoreNames: [fileSearchStoreName]
          }
        }]
      }
    })

    const answer = response.text || ''

    if (!answer) {
      throw new Error('Empty response from Gemini')
    }

    console.log('[RAG] Phase 1 complete: Retrieved context')

    return {
      answer,
      sources: []
    }
  } catch (error) {
    console.error('Error in RAG-only query:', error)
    throw new Error('Wystąpił błąd podczas wyszukiwania odpowiedzi')
  }
}

export async function executeToolWithContent(
  toolName: string,
  content: string,
  toolDefinition: { name: string; description: string; parameters: any }
): Promise<{ answer: string; toolResults: any }> {
  try {
    const ai = getGoogleAI()

    console.log(`[RAG] Phase 2: Tool-only execution (${toolName})`)

    const prompt = `User request: Use the ${toolName} tool to process the following content.

Content from documents:
${content}

IMPORTANT: You MUST call the ${toolName} function now.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{
          functionDeclarations: [toolDefinition]
        }]
      }
    })

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0]

      if (!call || !call.name) {
        throw new Error('Invalid function call from Gemini')
      }

      console.log('[RAG] Phase 2: Tool called:', call.name)

      const args = { ...call.args, content }
      const result = await executeToolLocally(call.name, args)

      console.log('[RAG] Phase 2: Sending result back for final answer')

      const finalPrompt = `Tool ${call.name} executed successfully.

Result: ${JSON.stringify(result, null, 2)}

Please provide a brief confirmation message to the user about what was created.`

      const finalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT
        }
      })

      const finalAnswer = finalResponse.text || 'Content created successfully.'

      const toolResultsFormatted: Record<string, ToolResult> = {
        [call.name]: result
      }

      console.log('[RAG] Phase 2 complete: Tool executed, returning result')

      return {
        answer: finalAnswer,
        toolResults: toolResultsFormatted
      }
    }

    throw new Error(`Tool ${toolName} was not called by Gemini`)
  } catch (error) {
    console.error('Error in tool execution:', error)
    throw new Error('Wystąpił błąd podczas wykonywania narzędzia')
  }
}
