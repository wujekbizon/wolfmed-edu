import 'server-only'
import { dedupeContextSources } from '@/helpers/dedupeContextSources'
import type { ContextChunk } from '@/types/retrievalTypes'

export function resolveEssayEvidence(chunks: ContextChunk[], evidence: { label: string; origin: string; quote: string }[]) {
  if (!evidence.length) throw new Error('Brak potwierdzenia treści w materiałach. Dodaj źródła lub zawęź temat.')
  const matched = evidence.map((entry) => {
    const quote = entry.quote.replace(/\s+/g, ' ').trim()
    const chunk = chunks.find((candidate) => candidate.label === entry.label && candidate.origin === entry.origin
      && candidate.text.replace(/\s+/g, ' ').includes(quote))
    if (!chunk) throw new Error('Nie udało się potwierdzić treści w źródłach. Spróbuj zawęzić temat.')
    return chunk
  })
  return dedupeContextSources(matched)
}
