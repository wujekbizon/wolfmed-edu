import 'server-only'
import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai'
import { SYSTEM_PROMPT, enhanceUserQuery } from '../helpers/rag-prompts'
import { getRagConfig } from '@/server/rag-queries'
import { executeToolLocally, type ToolResult } from './tools/executor'
import { GoogleAuth } from 'google-auth-library'

const PROJECT_ID = 'project-9d10f80c-d5df-459f-8d8'
const LOCATION = 'europe-west3'

let auth: GoogleAuth | null = null

function getAuthClient() {
  if (!auth) {
    auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    })
  }
  return auth
}

function getGoogleAI() {
  // const apiKey = process.env.GOOGLE_API_KEY
  // if (!apiKey) {
  //   throw new Error('GOOGLE_API_KEY is not configured')
  // }
  return new GoogleGenAI({
    project: 'project-9d10f80c-d5df-459f-8d8',
    location: 'europe-west3', // You can change this to your preferred region
    vertexai: true 
  }

  )
}

async function getAccessToken(): Promise<string> {
  const client = await getAuthClient().getClient()
  const tokenResponse = await client.getAccessToken()
  if (!tokenResponse.token) {
    throw new Error('Failed to obtain access token from ADC')
  }
  return tokenResponse.token
}

// Small helper so every REST call to Vertex AI doesn't repeat auth boilerplate
async function vertexFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken()
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Vertex AI API error (${res.status}): ${errBody}`)
  }
  return res.json()
}


// Vertex AI RAG Engine file upload uses a *different* base path (upload/v1, not v1)
// and requires a multipart/related body (metadata JSON part + raw file bytes part).
// This is the RAG-Engine equivalent of ai.fileSearchStores.uploadToFileSearchStore(),
// which only exists on the Gemini Developer API.
async function vertexUploadFetch(
  path: string,
  metadata: Record<string, unknown>,
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string   // ← new param
) {
  const token = await getAccessToken()
  const boundary = `rag_upload_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const url = `https://${LOCATION}-aiplatform.googleapis.com/upload/v1/${path}`

  const metadataPart =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="metadata"\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n`

  const filePartHeader =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`

  const closing = `\r\n--${boundary}--`

  const body = Buffer.concat([
    Buffer.from(metadataPart, 'utf-8'),
    Buffer.from(filePartHeader, 'utf-8'),
    fileBuffer,
    Buffer.from(closing, 'utf-8')
  ])

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,   // ← was multipart/related
      'X-Goog-Upload-Protocol': 'multipart'
    },
    body
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Vertex AI upload error (${res.status}): ${errBody}`)
  }
  return res.json()
}

function parseGoogleApiError(error: unknown): Error {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message)
      if (parsed.error?.message) {
        return new Error(parsed.error.message)
      }
    } catch {
      return error
    }
    return error
  }
  return new Error('Wystąpił nieznany błąd')
}

export async function createFileSearchStore(displayName: string): Promise<string> {
  try {
    const result = await vertexFetch(
      `projects/${PROJECT_ID}/locations/${LOCATION}/ragCorpora`,
      {
        method: 'POST',
        body: JSON.stringify({
          display_name: displayName,
          description: 'My Knowledge Base for RAG'
        })
      }
    )

    // TEMP: log the raw shape so we know what we're actually dealing with
    console.log('RAW createRagCorpus response:', JSON.stringify(result, null, 2))

    // Case 1: it's already the corpus (synchronous)
    if (result.name && result.name.includes('/ragCorpora/')) {
      return result.name
    }

    // Case 2: it's a long-running operation, poll it
    const opName = result.name as string | undefined
    if (!opName) {
      throw new Error('Unexpected response shape from corpus creation: ' + JSON.stringify(result))
    }

    let attempts = 0
    const maxAttempts = 30

    while (attempts < maxAttempts) {
      const status = await vertexFetch(opName)

      if (status.done) {
        if (status.error) {
          throw new Error(`Corpus creation failed: ${status.error.message}`)
        }
        if (!status.response?.name) {
          throw new Error('Corpus created but no name returned: ' + JSON.stringify(status))
        }
        return status.response.name
      }

      await new Promise((resolve) => setTimeout(resolve, 3000))
      attempts++
    }

    throw new Error('Timed out waiting for RAG corpus creation')
  } catch (error) {
    console.error('Error creating RAG corpus:', error)
    throw error // temporarily rethrow the real error instead of a generic message, so we can see what's actually happening
  }
}

export async function deleteFileSearchStore(storeName: string): Promise<void> {
  try {
    // storeName is the full RAG corpus resource name, e.g.
    // projects/{project}/locations/{location}/ragCorpora/{id}
    await vertexFetch(storeName, { method: 'DELETE' })
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

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // storeName is the full ragCorpus resource name, e.g.
        // projects/{project}/locations/{location}/ragCorpora/{id}
        // Vertex RAG Engine's direct upload is synchronous (no LRO to poll),
        // unlike the Gemini fileSearchStores upload.
        const uploadResult = await vertexUploadFetch(
          `${storeName}/ragFiles:upload`,
          { rag_file: { display_name: file.name } },
          buffer,
          mimeType,
          file.name   // ← new arg
        )

        if (uploadResult.error) {
          throw new Error(uploadResult.error.message || 'Upload failed')
        }
        console.log('RAW upload response:', JSON.stringify(uploadResult, null, 2))

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

    // Note: `fileSearch` is a Gemini Developer API tool. Vertex AI's RAG Engine
    // exposes retrieval through `retrieval.vertexRagStore` instead, pointed at
    // the ragCorpus resource name.
    const configTools: any[] = [
      {
        retrieval: {
          vertexRagStore: {
            ragCorpora: [fileSearchStoreName]
          }
        }
      }
    ]

    if (tools && tools.length > 0) {
      configTools.push({
        functionDeclarations: tools.map((tool) => ({
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

    if (
      response.functionCalls &&
      Array.isArray(response.functionCalls) &&
      response.functionCalls.length > 0
    ) {
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

      const toolResultsText = executedTools
        .map(({ name, result }) => {
          return `Tool: ${name}\nResult: ${JSON.stringify(result, null, 2)}`
        })
        .join('\n\n')

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
    // storeName is the full ragCorpus resource name.
    const store = await vertexFetch(storeName)

    return {
      name: store.name || storeName,
      displayName: store.displayName ?? store.display_name ?? undefined
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
    // storeName is the full ragCorpus resource name.
    const response = await vertexFetch(`${storeName}/ragFiles`)
    console.log('RAW listRagFiles response:', JSON.stringify(response, null, 2))
    const documents: any[] = response.ragFiles || []

    return documents.map((doc: any) => ({
      name: doc.name || '',
      displayName: doc.displayName || doc.display_name || doc.name || 'Unknown'
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: enhancedQuery,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [
          {
            retrieval: {
              vertexRagStore: {
                ragCorpora: [fileSearchStoreName]
              }
            }
          }
        ]
      }
    })

    const answer = response.text || ''

    if (!answer) {
      throw new Error('Empty response from Gemini')
    }

    return {
      answer,
      sources: []
    }
  } catch (error) {
    console.error('Error in RAG-only query:', error)
    throw parseGoogleApiError(error)
  }
}

type PdfFile = { title: string; base64: string; mimeType: string }

export async function executeToolWithContent(
  toolName: string,
  content: string,
  toolDefinition: { name: string; description: string; parameters: any },
  pdfFiles?: PdfFile[]
): Promise<{ answer: string; toolResults: any }> {
  try {
    const ai = getGoogleAI()

    // Build content parts - text + any PDF files as inline data
    const parts: Array<
      { text: string } | { inlineData: { data: string; mimeType: string } }
    > = []

    // Add PDF files as inline data (they become PRIMARY sources)
    if (pdfFiles && pdfFiles.length > 0) {
      for (const pdf of pdfFiles) {
        parts.push({
          inlineData: {
            data: pdf.base64,
            mimeType: pdf.mimeType
          }
        })
      }
    }

    // Build the prompt - tell the model to READ the PDF and use it for the tool
    let prompt = `ZADANIE: Użyj narzędzia ${toolName} aby przetworzyć treść.

`
    if (pdfFiles && pdfFiles.length > 0) {
      prompt += `GŁÓWNE ŹRÓDŁO: Powyższy plik PDF został wybrany przez użytkownika. Przeczytaj go dokładnie i użyj jego treści jako podstawy dla narzędzia.

`
    }

    if (content) {
      prompt += `DODATKOWE INFORMACJE:
${content}

`
    }

    prompt += `WAŻNE: Musisz teraz wywołać funkcję ${toolName}, przekazując treść z PDF (jeśli jest) jako parametr 'content'.`

    parts.push({ text: prompt })

    // Wrap in role/parts structure for multimodal content
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: parts
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [
          {
            functionDeclarations: [toolDefinition]
          }
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: [toolName]
          }
        }
      }
    })

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0]

      if (!call || !call.name) {
        throw new Error('Invalid function call from Gemini')
      }

      // Use the content the model extracted from PDF, fallback to our text content
      const toolContent = call.args?.content || content
      const args = { ...call.args, content: toolContent }
      const result = await executeToolLocally(call.name, args)

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

      return {
        answer: finalAnswer,
        toolResults: toolResultsFormatted
      }
    }

    throw new Error(`Tool ${toolName} was not called by Gemini`)
  } catch (error) {
    console.error('Error in tool execution:', error)
    throw parseGoogleApiError(error)
  }
}