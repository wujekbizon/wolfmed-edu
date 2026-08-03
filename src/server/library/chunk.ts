import { CHUNK_OVERLAP, CHUNK_SIZE, MAX_CHUNKS_PER_SOURCE, MIN_CHUNK_CHARS } from './config'

export interface TextChunk {
  position: number
  content: string
}

// Paragraph, then sentence, then whitespace. Splitting mid-sentence blurs the
// embedding and reads badly when a chunk is quoted back as a source.
const BOUNDARY_PATTERNS = [/\n\s*\n/g, /(?<=[.!?])\s+/g, /\s+/g]

function lastBoundaryBefore(text: string, limit: number): number {
  for (const pattern of BOUNDARY_PATTERNS) {
    let best = -1
    for (const match of text.matchAll(pattern)) {
      const end = match.index + match[0].length
      if (end > limit) break
      // Ignore breaks so early that the chunk would be mostly padding.
      if (end >= limit * 0.5) best = end
    }
    if (best > 0) return best
  }
  return limit
}

/**
 * Splits text into overlapping chunks on the cleanest boundary available.
 *
 * Pure and deterministic: the same text must always yield the same chunks, or
 * the content hashes shift and every save rewrites every row.
 */
export function chunkText(text: string): TextChunk[] {
  const normalised = text.replace(/\r\n/g, '\n').trim()
  if (normalised.length === 0) return []
  if (normalised.length <= CHUNK_SIZE) return [{ position: 0, content: normalised }]

  const chunks: TextChunk[] = []
  let cursor = 0

  while (cursor < normalised.length && chunks.length < MAX_CHUNKS_PER_SOURCE) {
    const remaining = normalised.slice(cursor)

    if (remaining.length <= CHUNK_SIZE) {
      const tail = remaining.trim()
      // A short tail rides along with the previous chunk rather than becoming a
      // fragment of its own.
      if (tail.length < MIN_CHUNK_CHARS && chunks.length > 0) {
        const previous = chunks[chunks.length - 1]!
        previous.content = `${previous.content}\n${tail}`.trim()
      } else if (tail.length > 0) {
        chunks.push({ position: chunks.length, content: tail })
      }
      break
    }

    const breakAt = lastBoundaryBefore(remaining, CHUNK_SIZE)
    const piece = remaining.slice(0, breakAt).trim()
    if (piece.length > 0) chunks.push({ position: chunks.length, content: piece })

    // Always advance, even if the boundary search returned something degenerate,
    // or a pathological input loops forever.
    cursor += Math.max(breakAt - CHUNK_OVERLAP, 1)
  }

  return chunks
}
