import type { ChunkOrigin, ContextChunk } from '@/types/retrievalTypes'

const ORIGIN_LABELS: Record<ChunkOrigin, string> = {
  corpus: 'BAZA WIEDZY',
  note: 'TWOJA NOTATKA',
  material: 'TWÓJ MATERIAŁ',
}

/**
 * Renders retrieved chunks with their origin attached to each one.
 *
 * The label is the safeguard that makes indexing a student's own notes
 * acceptable. A half-finished note is not curriculum, and an answer resting on
 * one has to be distinguishable from an answer resting on the documentation —
 * both to the model deciding how much weight to give it, and to the student
 * reading where it came from.
 */
export function formatContextChunks(chunks: ContextChunk[]): string {
  return chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] (${ORIGIN_LABELS[chunk.origin]} — ${chunk.label})\n${chunk.text}`
    )
    .join('\n\n')
}
