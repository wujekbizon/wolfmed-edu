import 'server-only'
import { getGoogleAI } from '@/server/vertex-rag/client'
import {
  EMBED_BACKGROUND_TIMEOUT_MS,
  EMBED_DIM,
  EMBED_MAX_RETRIES,
  EMBED_RETRY_BASE_MS,
  EMBEDDING_MODEL,
  EMBED_TIMEOUT_MS,
} from '@/constants/embeddings'

// Thrown when the embedding call times out or fails. Callers catch this and
// cascade to the lexical (trgm/ILIKE) tiers instead of hanging or 500-ing the
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

async function embedManyOnce(
  texts: string[],
  taskType: EmbedTaskType
): Promise<number[][]> {
  const ai = getGoogleAI()
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: {
      taskType,
      outputDimensionality: EMBED_DIM,
    },
  })

  const embeddings = response.embeddings ?? []

  // A model that only accepts one input per request answers a batch with a
  // single embedding rather than an error. Treating that as success would
  // silently write one chunk's vector onto every chunk in the batch.
  if (embeddings.length !== texts.length) {
    throw new EmbeddingUnavailable(
      `expected ${texts.length} embeddings, got ${embeddings.length}`
    )
  }

  return embeddings.map((embedding, index) => {
    const values = embedding.values
    if (!values || values.length !== EMBED_DIM) {
      throw new EmbeddingUnavailable(
        `expected ${EMBED_DIM}-dim vector at index ${index}, got ${values?.length ?? 'none'}`
      )
    }
    return values
  })
}

async function embedOnce(text: string, taskType: EmbedTaskType): Promise<number[]> {
  const [values] = await embedManyOnce([text], taskType)
  return values!
}

// Worth waiting out rather than giving up on: a per-minute quota that will
// refill, or a transient unavailability. Anything else — a bad key, a wrong
// dimension, a malformed request — will fail identically on every attempt, so
// retrying only delays the error.
function isRetryable(error: unknown): boolean {
  const status = (error as { status?: number } | undefined)?.status
  if (status === 429 || status === 503) return true

  const message = error instanceof Error ? error.message : String(error)
  return /RESOURCE_EXHAUSTED|UNAVAILABLE|\b(429|503)\b/.test(message)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface EmbedOptions {
  timeoutMs?: number
  // Attempts after the first. Zero on the request path, where a retry only makes
  // a student wait for something the lexical tier already covers.
  retries?: number
}

// Embeds a single text, bounded by a timeout chosen for the caller's context.
// Throws EmbeddingUnavailable on timeout or any API error so callers can cascade
// deterministically.
export async function embed(
  text: string,
  taskType: EmbedTaskType,
  { timeoutMs = EMBED_TIMEOUT_MS, retries = 0 }: EmbedOptions = {}
): Promise<number[]> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout(embedOnce(text, taskType), timeoutMs)
    } catch (error) {
      lastError = error instanceof EmbeddingUnavailable ? error.cause ?? error : error
      if (attempt === retries || !isRetryable(lastError)) break

      // Exponential, with jitter so a batch of chunks that all failed together
      // does not come back together and trip the same quota again.
      const backoff = EMBED_RETRY_BASE_MS * 2 ** attempt
      await sleep(backoff + Math.random() * EMBED_RETRY_BASE_MS)
    }
  }

  if (lastError instanceof EmbeddingUnavailable) throw lastError
  throw new EmbeddingUnavailable(lastError)
}

// Documents are embedded off the request path, so they get the background budget
// and the retries by default.
export const embedDocument = (text: string) =>
  embed(text, 'RETRIEVAL_DOCUMENT', {
    timeoutMs: EMBED_BACKGROUND_TIMEOUT_MS,
    retries: EMBED_MAX_RETRIES,
  })

export const embedQuery = (text: string) => embed(text, 'RETRIEVAL_QUERY')

/**
 * Embeds several documents in one request where the model allows it.
 *
 * The quota that matters here meters *requests*, not tokens, so a 24-chunk
 * document costs 24 units one-at-a-time and 2 in batches of 16. That is the
 * difference between fitting the allowance and exhausting it.
 *
 * Falls back to sequential calls when the model rejects multiple inputs, and
 * says which path it took — whether a given model supports batching is not
 * something to assume silently in either direction.
 */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  if (texts.length === 1) return [await embedDocument(texts[0]!)]

  let lastError: unknown

  for (let attempt = 0; attempt <= EMBED_MAX_RETRIES; attempt++) {
    try {
      return await withTimeout(
        embedManyOnce(texts, 'RETRIEVAL_DOCUMENT'),
        EMBED_BACKGROUND_TIMEOUT_MS
      )
    } catch (error) {
      lastError = error instanceof EmbeddingUnavailable ? error.cause ?? error : error

      // A refusal to batch is not a rate limit and will not improve with time.
      if (!isRetryable(lastError)) break

      const backoff = EMBED_RETRY_BASE_MS * 2 ** attempt
      await sleep(backoff + Math.random() * EMBED_RETRY_BASE_MS)
    }
  }

  if (isRetryable(lastError)) {
    throw lastError instanceof EmbeddingUnavailable
      ? lastError
      : new EmbeddingUnavailable(lastError)
  }

  console.info('[embeddings] Batch rejected, falling back to one request per text:', lastError)

  const results: number[][] = []
  for (const text of texts) results.push(await embedDocument(text))
  return results
}
