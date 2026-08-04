import { PERSONAL_MISS_SCORE } from '@/server/library/config'
import type { LibraryHit } from '@/server/library/retrieve'

/**
 * Keeps only the documents that actually match, judged one document at a time.
 *
 * A tier-wide gate opens on its single best chunk, so one relevant note lets
 * every unrelated document in behind it — a sociology PDF was cited at 0.528
 * under a cholesterol answer because a note scored 0.674. Grouping by sourceId
 * keeps the distinction that matters: the weak tail of a relevant document is
 * still that document, a weak chunk of another one is noise.
 */
export function dropMissedSources(hits: LibraryHit[]): LibraryHit[] {
  const best = new Map<string, number>()
  for (const hit of hits) {
    best.set(hit.sourceId, Math.max(best.get(hit.sourceId) ?? -Infinity, hit.score))
  }

  return hits.filter((hit) => (best.get(hit.sourceId) ?? -Infinity) >= PERSONAL_MISS_SCORE)
}
