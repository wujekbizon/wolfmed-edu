import 'server-only'
import { RAG_TOP_K, RAG_VECTOR_DISTANCE_THRESHOLD } from '@/constants/rag'
import { retrieveContexts } from './retrieve'

export interface CorpusContext {
  text: string
  sources: string[]
  chunkCount: number
}

/**
 * The single way every flow reads the corpus.
 *
 * `searchQuery` must be the subject alone. Memory, attached resources and
 * formatting instructions dilute the query embedding — that is how a term
 * present in the corpus comes back as "no information".
 */
export async function retrieveCorpusContext(
  searchQuery: string,
  options: { topK?: number; threshold?: number; corpusName?: string } = {}
): Promise<CorpusContext | null> {
  const query = searchQuery.trim()
  if (!query) return null

  const contexts = await retrieveContexts(query, {
    topK: options.topK ?? RAG_TOP_K,
    vectorDistanceThreshold: options.threshold ?? RAG_VECTOR_DISTANCE_THRESHOLD,
    ...(options.corpusName ? { corpusName: options.corpusName } : {}),
  })

  if (contexts.length === 0) return null

  const sources = [
    ...new Set(
      contexts
        .map((context) => context.sourceDisplayName)
        .filter((name): name is string => Boolean(name))
    ),
  ]

  return {
    text: contexts.map((context, index) => `[${index + 1}] ${context.text}`).join('\n\n'),
    sources,
    chunkCount: contexts.length,
  }
}
