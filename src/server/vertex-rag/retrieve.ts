import 'server-only'
import { PROJECT_ID, LOCATION, vertexFetch } from './client'
import { getRagConfig } from '@/server/rag-queries'
import { RAG_TOP_K, RAG_VECTOR_DISTANCE_THRESHOLD } from '@/constants/rag'
import { parseGoogleApiError } from './errors'

export interface RetrievedContext {
  text: string
  sourceUri?: string | undefined
  sourceDisplayName?: string | undefined
  score?: number | undefined
}

// Retrieval-only path: query embedding + vector search, no generation. Powers
// the admin "search the knowledge base" feature and pre-flight checks that guard
// expensive generation (Phase 3's empty-retrieval short-circuit). Far cheaper
// than managed grounding — you pay the query embedding + vector DB usage only.
export async function retrieveContexts(
  question: string,
  options: {
    corpusName?: string
    topK?: number
    vectorDistanceThreshold?: number
  } = {}
): Promise<RetrievedContext[]> {
  try {
    let corpusName = options.corpusName
    if (!corpusName) {
      const config = await getRagConfig()
      corpusName = config?.storeName
    }
    if (!corpusName) {
      throw new Error('File Search Store nie jest skonfigurowany')
    }

    const response = await vertexFetch(
      `projects/${PROJECT_ID}/locations/${LOCATION}:retrieveContexts`,
      {
        method: 'POST',
        body: JSON.stringify({
          vertex_rag_store: {
            rag_resources: [{ rag_corpus: corpusName }],
          },
          query: {
            text: question,
            rag_retrieval_config: {
              top_k: options.topK ?? RAG_TOP_K,
              filter: {
                vector_distance_threshold:
                  options.vectorDistanceThreshold ?? RAG_VECTOR_DISTANCE_THRESHOLD,
              },
            },
          },
        }),
      }
    )

    const contexts: Array<Record<string, unknown>> = response.contexts?.contexts ?? []
    return contexts.map((ctx) => ({
      text: String(ctx.text ?? ''),
      sourceUri: (ctx.sourceUri ?? ctx.source_uri) as string | undefined,
      sourceDisplayName: (ctx.sourceDisplayName ?? ctx.source_display_name) as string | undefined,
      score: (ctx.score ?? ctx.distance) as number | undefined,
    }))
  } catch (error) {
    console.error('Error retrieving contexts:', error)
    throw parseGoogleApiError(error)
  }
}
