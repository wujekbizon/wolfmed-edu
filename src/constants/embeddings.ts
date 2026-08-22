// Platform-wide embedding settings. Shared by the memory layer and the personal
// library, so neither owns them and neither imports them from the other.

// Embedding dimension. Hard rule: this constant is the ONLY place the number 768
// appears. Every VECTOR() column and the embeddings client's
// outputDimensionality import it — dimension drift between code and the column
// type is a known real-world failure.
export const EMBED_DIM = 768

// Same multilingual model the Vertex corpus uses, truncated to EMBED_DIM via
// Matryoshka (MRL) so the pgvector HNSW indexes stay small. Note the corpus
// itself embeds at the model's default dimensionality, so corpus and local
// vectors are NOT in the same space and their distances are not comparable.
export const EMBEDDING_MODEL = 'gemini-embedding-001'

// Request path. Embedding is a best-effort projection here: if it can't return
// quickly, retrieval cascades to lexical search rather than make a student wait.
export const EMBED_TIMEOUT_MS = 1500

// Background work — the indexing sweep. Nobody is waiting, so the only thing a
// short budget buys is failure: a cold Vertex call routinely exceeds 1.5 s, and
// giving up on it leaves the chunk permanently unembedded.
export const EMBED_BACKGROUND_TIMEOUT_MS = 20_000

// Vertex meters online_prediction_requests_per_base_model per minute, and the
// default allowance for gemini-embedding is small — a 24-chunk document sent
// back to back exhausts it within a second. These govern how the background
// path stays inside it.

// Retries for a rate-limited or briefly unavailable call. Background only: on
// the request path a retry would just make a student wait longer for something
// the lexical tier already covers.
export const EMBED_MAX_RETRIES = 5

// Exponential, with jitter: 2s, 4s, 8s, 16s, 32s — a full minute of waiting.
// The quota refills on a per-minute window, so a backoff that tops out before
// sixty seconds gives up while still inside the window that rejected it.
export const EMBED_RETRY_BASE_MS = 2000

// Spacing between successive calls. Cheap insurance that a long document does
// not hit the ceiling in the first place — retrying is recovery, pacing is
// avoidance, and avoidance is what keeps other callers working.
export const EMBED_PACE_MS = 250

// How many texts to send per request. The quota meters REQUESTS, not tokens, so
// embedding a document in one call instead of twenty-four is the difference
// between fitting the allowance and exhausting it.
//
// Not every embedding model accepts more than one input per request. The batch
// path falls back to one-at-a-time when a model refuses, and logs which path it
// took, so this is safe to leave on regardless.
export const EMBED_BATCH_SIZE = 16
