import 'server-only'
import { PROJECT_ID, LOCATION, vertexFetch } from './client'

// Default for corpora created from here on. gemini-embedding-001 is multilingual
// (MTEB leader) — correct for Polish medical content, unlike the English
// text-embedding-005 that RAG Engine falls back to when no model is specified.
//
// This is an intention, not a description of the live corpus. The corpus in
// production predates this config and runs text-multilingual-embedding-002 at 768
// dimensions (recorded in rag_config.embedding_model, which is the source of
// truth). So the platform does NOT speak one embedding space: corpus and personal
// library vectors are the same length but come from different models, and their
// distances are not comparable. That is why retrieval fuses the two by rank
// rather than by score.
export const DEFAULT_EMBEDDING_MODEL = 'gemini-embedding-001'

function embeddingEndpoint(embeddingModel: string): string {
  return `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${embeddingModel}`
}

// Creates a RAG corpus with an explicit embedding model. The model is nested in
// vector_db_config on purpose: specifying it at the corpus top level is the
// documented pitfall that silently reverts to text-embedding-005. The backend
// (Spanner vs Serverless) is governed by the project's RagEngineConfig, not set
// here, so this body is correct in either deployment mode.
export async function createCorpus(
  displayName: string,
  embeddingModel: string = DEFAULT_EMBEDDING_MODEL
): Promise<string> {
  try {
    const result = await vertexFetch(
      `projects/${PROJECT_ID}/locations/${LOCATION}/ragCorpora`,
      {
        method: 'POST',
        body: JSON.stringify({
          display_name: displayName,
          description: 'My Knowledge Base for RAG',
          vector_db_config: {
            rag_embedding_model_config: {
              vertex_prediction_endpoint: {
                endpoint: embeddingEndpoint(embeddingModel),
              },
            },
          },
        }),
      }
    )

    // Synchronous: response is already the corpus.
    if (result.name && result.name.includes('/ragCorpora/')) {
      return result.name
    }

    // Async: response is a long-running operation to poll.
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
    throw error
  }
}

export async function deleteCorpus(corpusName: string): Promise<void> {
  try {
    // corpusName is the full resource name:
    // projects/{project}/locations/{location}/ragCorpora/{id}
    await vertexFetch(corpusName, { method: 'DELETE' })
  } catch (error) {
    console.error('Error deleting RAG corpus:', error)
    throw new Error('Nie można usunąć File Search Store')
  }
}

export async function getCorpus(corpusName: string): Promise<{
  name: string
  displayName?: string | undefined
}> {
  try {
    const corpus = await vertexFetch(corpusName)
    return {
      name: corpus.name || corpusName,
      displayName: corpus.displayName ?? corpus.display_name ?? undefined,
    }
  } catch (error) {
    console.error('Error getting corpus info:', error)
    throw new Error('Nie można pobrać informacji o File Search Store')
  }
}
