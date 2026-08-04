// word_similarity scores a query against the chunk's best matching extent, so
// every word the student wraps their question in has to be matched too. Measured
// against a chunk that literally opens with the definition:
//
//   'etnocentryzm'                  → 1.000
//   'wyjaśnij pojęcie etnocentryzm' → 0.467
//
// Two filler words dropped the defining chunk to roughly rank 10 of 12 inside its
// own document. This is the CLAUDE.md rule — the search query is the subject and
// nothing else — applied where the student types prose instead of a topic.
const FILLER = new Set([
  'wyjaśnij',
  'wyjasnij',
  'wytłumacz',
  'wytlumacz',
  'opisz',
  'omów',
  'omow',
  'przedstaw',
  'wymień',
  'wymien',
  'podaj',
  'powiedz',
  'opowiedz',
  'czym',
  'jest',
  'są',
  'sa',
  'to',
  'co',
  'jak',
  'jaki',
  'jaka',
  'jakie',
  'jakich',
  'dlaczego',
  'kiedy',
  'gdzie',
  'czy',
  'proszę',
  'prosze',
  'mi',
  'mnie',
  'mój',
  'moj',
  'pojęcie',
  'pojecie',
  'pojęcia',
  'pojecia',
  'definicja',
  'definicję',
  'definicje',
  'znaczy',
  'oznacza',
  'polega',
  'dokładnie',
  'dokladnie',
  'krótko',
  'krotko',
  'mógłbyś',
  'moglbys',
  'możesz',
  'mozesz',
])

/**
 * Reduces a typed question to its subject for retrieval.
 *
 * Falls back to the original whenever stripping would leave nothing — "co to
 * jest?" is all filler, and an empty query retrieves nothing at all.
 */
export function stripQueryFiller(query: string): string {
  const words = query
    .replace(/[?!.,;:]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  const kept = words.filter((word) => !FILLER.has(word.toLowerCase()))

  return kept.length > 0 ? kept.join(' ') : query.trim()
}
