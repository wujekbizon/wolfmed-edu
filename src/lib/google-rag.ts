/**
 * Google GenAI File Search Integration
 * Handles file search store creation, document uploads, and RAG queries
 */

import 'server-only'
import { GoogleGenAI } from '@google/genai'
import fs from 'fs/promises'
import path from 'path'
import { SYSTEM_PROMPT, enhanceUserQuery } from './rag-prompts'

// Initialize Google GenAI client
function getGoogleAI() {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured')
  }
  return new GoogleGenAI({ apiKey })
}

/**
 * Create a new File Search Store
 * @param displayName - Name for the file search store
 * @returns Store name (projects/.../fileSearchStores/...)
 */
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

/**
 * Upload a document to the File Search Store
 * @param storeName - The file search store name
 * @param filePath - Path to the file to upload
 * @param displayName - Display name for the uploaded file
 * @returns Operation result
 */
export async function uploadDocumentToStore(
  storeName: string,
  filePath: string,
  displayName: string
): Promise<{ success: boolean; fileName?: string }> {
  try {
    const ai = getGoogleAI()

    const mimeType = filePath.endsWith(".md")
          ? "text/markdown"
          : "text/plain"
    // Upload and import the file
    let operation = await ai.fileSearchStores.uploadToFileSearchStore({
      file: filePath,
      fileSearchStoreName: storeName,
      config: { 
        displayName,
        mimeType }
    })

    // Poll until the operation is complete
    let attempts = 0
    const maxAttempts = 60 // 5 minutes with 5 second intervals

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

    return {
      success: true,
      fileName: displayName
    }
  } catch (error) {
    console.error(`Error uploading document ${displayName}:`, error)
    throw new Error(`Nie można przesłać dokumentu: ${displayName}`)
  }
}

/**
 * Upload all medical documentation files to the store
 * @param storeName - The file search store name
 * @returns Results of all uploads
 */
export async function uploadMedicalDocuments(
  storeName: string
): Promise<{ success: boolean; uploaded: string[]; failed: string[] }> {
  const docsPath = path.join(process.cwd(), 'docs')
  const results = {
    success: true,
    uploaded: [] as string[],
    failed: [] as string[]
  }

  try {
    // Read all .md files from docs directory
    const files = await fs.readdir(docsPath)
    const mdFiles = files.filter(file => file.endsWith('.md'))

    if (mdFiles.length === 0) {
      throw new Error('No markdown files found in /docs directory')
    }

    // Upload each file
    for (const file of mdFiles) {
      const filePath = path.join(docsPath, file)
      const displayName = file.replace('.md', '')

      try {
        await uploadDocumentToStore(storeName, filePath, displayName)
        results.uploaded.push(displayName)
      } catch (error) {
        console.error(`Failed to upload ${file}:`, error)
        results.failed.push(displayName)
        results.success = false
      }
    }

    return results
  } catch (error) {
    console.error('Error uploading medical documents:', error)
    throw new Error('Nie można przesłać dokumentów medycznych')
  }
}

/**
 * Query the RAG system with file search
 * @param question - User's question
 * @param storeName - The file search store name (optional, uses env var if not provided)
 * @returns AI response
 */
export async function queryWithFileSearch(
  question: string,
  storeName?: string
): Promise<{ answer: string; sources?: string[] }> {
  try {
    const ai = getGoogleAI()

    // Get store name from parameter or environment variable
    const fileSearchStoreName = storeName || process.env.GOOGLE_FILE_SEARCH_STORE_NAME

    if (!fileSearchStoreName) {
      throw new Error('GOOGLE_FILE_SEARCH_STORE_NAME is not configured')
    }

    // Enhance user query with additional context
    const enhancedQuery = enhanceUserQuery(question)

    // Query with file search tool and system instruction
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

    // Extract answer text
    const answer = response.text || ''

    if (!answer) {
      throw new Error('Empty response from Gemini')
    }

    // TODO: Extract source citations if available from response metadata
    // This will depend on the actual response structure from Google GenAI

    return {
      answer,
      sources: [] // Placeholder for future implementation
    }
  } catch (error) {
    console.error('Error querying with file search:', error)

    // Handle specific error cases
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

/**
 * Get store information
 * @param storeName - The file search store name
 * @returns Store metadata
 */
export async function getStoreInfo(storeName: string): Promise<{
  name: string
  displayName?: string | undefined
}> {
  try {
    const ai = getGoogleAI()

    // Get store details
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

/**
 * List documents in the store
 * @param storeName - The file search store name
 * @returns List of documents
 */
export async function listStoreDocuments(storeName: string): Promise<
  Array<{
    name: string
    displayName: string
  }>
> {
  try {
    const ai = getGoogleAI()

    // List files in the store
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
