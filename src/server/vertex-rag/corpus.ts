import 'server-only'
import { PROJECT_ID, LOCATION, vertexFetch } from './client'

// What production actually runs, so creating a corpus reproduces current
// behaviour instead of silently changing it. Verified against the live corpus and
// recorded in rag_config.embedding_model, which is the source of truth.
//
// It is multilingual, which is what matters for Polish — the failure to avoid is
// the English text-embedding-005 that RAG Engine falls back to when no model is
// given at all.
//
// Switching models is a migration, not a default: every document has to be
// re-ingested, and the new vectors live in a different space from the old. Note
// that gemini-embedding-001 would also need an explicit output dimensionality —
// it defaults to 3072, so adopting it without that would match neither this
// corpus nor the 768-dimension personal library.
export const DEFAULT_EMBEDDING_MODEL = 'text-multilingual-embedding-002'

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

// Pulls the model id out of the endpoint path the corpus reports, e.g.
// projects/x/locations/y/publishers/google/models/text-multilingual-embedding-002
function embeddingModelFromCorpus(corpus: Record<string, any>): string | undefined {
  const config = corpus.vectorDbConfig ?? corpus.vector_db_config
  const endpoint =
    config?.ragEmbeddingModelConfig?.vertexPredictionEndpoint?.endpoint ??
    config?.rag_embedding_model_config?.vertex_prediction_endpoint?.endpoint

  return typeof endpoint === 'string' ? endpoint.split('/models/')[1] : undefined
}

export async function getCorpus(corpusName: string): Promise<{
  name: string
  displayName?: string | undefined
  embeddingModel?: string | undefined
}> {
  try {
    const corpus = await vertexFetch(corpusName)
    return {
      name: corpus.name || corpusName,
      displayName: corpus.displayName ?? corpus.display_name ?? undefined,
      // What the corpus reports, not what we asked for. RAG Engine substitutes a
      // fallback model when it dislikes the request, and recording the request
      // instead of the result is how rag_config comes to describe a corpus that
      // does not exist.
      embeddingModel: embeddingModelFromCorpus(corpus),
    }
  } catch (error) {
    console.error('Error getting corpus info:', error)
    throw new Error('Nie można pobrać informacji o File Search Store')
  }
}
