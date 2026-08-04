import type { ChunkOrigin, ContextChunk } from '@/types/retrievalTypes'

const ORIGIN_LABELS: Record<ChunkOrigin, string> = {
  corpus: 'BAZA WIEDZY',
  note: 'TWOJA NOTATKA',
  material: 'TWÓJ MATERIAŁ',
}

/**
 * Renders retrieved chunks with their origin attached to each one.
 *
 * The label tells the model how much weight a fragment carries — a half-finished
 * note is not curriculum. It is not a citation key: the chunks are deliberately
 * unnumbered, because a numbered list is an invitation to echo "[10]" into the
 * answer, where it refers to nothing the student can see.
 */
export function formatContextChunks(chunks: ContextChunk[]): string {
  return chunks
    .map((chunk) => `--- ${ORIGIN_LABELS[chunk.origin]} — ${chunk.label}\n${chunk.text}`)
    .join('\n\n')
}
