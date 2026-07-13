import 'server-only'
import { getGoogleAI } from '@/server/vertex-rag/client'
import { EMBED_DIM, EMBEDDING_MODEL, EMBED_TIMEOUT_MS } from './config'

// Thrown when the embedding call times out or fails. Retrieval catches this and
// cascades to the lexical (trgm/ILIKE) tiers instead of hanging or 500-ing the
// request — the embedding is a projection, never a hard dependency.
export class EmbeddingUnavailable extends Error {
  constructor(cause?: unknown) {
    super('Embedding unavailable')
    this.name = 'EmbeddingUnavailable'
    if (cause) this.cause = cause
  }
}

// Documents (facts/episodes at write time) and queries (retrieval) must embed
// with matching task types for asymmetric retrieval to work.
export type EmbedTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new EmbeddingUnavailable('timeout')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

async function embedOnce(text: string, taskType: EmbedTaskType): Promise<number[]> {
  const ai = getGoogleAI()
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [text],
    config: {
      taskType,
      outputDimensionality: EMBED_DIM,
    },
  })

  const values = response.embeddings?.[0]?.values
  if (!values || values.length !== EMBED_DIM) {
    throw new EmbeddingUnavailable(
      `expected ${EMBED_DIM}-dim vector, got ${values?.length ?? 'none'}`
    )
  }
  return values
}

// Embeds a single text, bounded by EMBED_TIMEOUT_MS. Throws EmbeddingUnavailable
// on timeout or any API error so callers can cascade deterministically.
export async function embed(text: string, taskType: EmbedTaskType): Promise<number[]> {
  try {
    return await withTimeout(embedOnce(text, taskType), EMBED_TIMEOUT_MS)
  } catch (error) {
    if (error instanceof EmbeddingUnavailable) throw error
    throw new EmbeddingUnavailable(error)
  }
}

export const embedDocument = (text: string) => embed(text, 'RETRIEVAL_DOCUMENT')
export const embedQuery = (text: string) => embed(text, 'RETRIEVAL_QUERY')
