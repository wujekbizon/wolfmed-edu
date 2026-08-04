import type { ContextChunk } from '@/types/retrievalTypes'

// Instrumentation for setting the corpus relevance threshold. Both tiers are
// printed with their own scores and their fate, because the question is whether
// a distribution can be told apart from a miss — not what any single number is.
//
// Corpus scores come from Vertex, library scores from pgvector/pg_trgm. They are
// not comparable across tiers; read each column against itself.
const line = (chunk: ContextChunk, kept: boolean): string =>
  `  ${kept ? '✓' : '·'} ${chunk.score?.toFixed(3) ?? '  -  '}  ${chunk.origin.padEnd(8)} ${chunk.label}`

export function logRetrievalScores(
  query: string,
  corpus: ContextChunk[],
  personal: ContextChunk[],
  selected: ContextChunk[]
): void {
  const keptText = new Set(selected.map((chunk) => chunk.text))
  const render = (chunks: ContextChunk[]) =>
    chunks.map((chunk) => line(chunk, keptText.has(chunk.text))).join('\n')

  console.log(
    [
      `[retrieval] "${query}"`,
      `  corpus (${corpus.length}), personal (${personal.length}), selected ${selected.length}`,
      render(corpus),
      render(personal),
    ]
      .filter(Boolean)
      .join('\n')
  )
}
