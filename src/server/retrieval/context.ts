import 'server-only'
import { CORPUS_MISS_DISTANCE, RAG_TOP_K } from '@/constants/rag'
import {
  CANONICAL_RESERVED_SLOTS,
  ENABLE_IMPLICIT_PERSONAL_RETRIEVAL,
  LIB_SLOT_SHARE,
  LIB_TOP_K,
  RRF_K,
} from '@/server/library/config'
import { retrieveLibrary, type LibraryHit } from '@/server/library/retrieve'
import { getAttachedSourceText } from '@/server/library/attached-source'
import { retrieveContexts } from '@/server/vertex-rag/retrieve'
import { reciprocalRankFusion } from '@/helpers/reciprocalRankFusion'
import { logRetrievalScores } from '@/helpers/logRetrievalScores'
import { isCorpusMiss } from '@/helpers/isCorpusMiss'
import { stripQueryFiller } from '@/helpers/stripQueryFiller'
import type {
  ContextChunk,
  RetrieveContextOptions,
  RetrievedContext,
  SourceRef,
} from '@/types/retrievalTypes'

const EMPTY: RetrievedContext = { chunks: [], sources: [], hasCanonical: false }

// One entry per document, keyed by label AND origin: a student's note may share
// a title with a curriculum file, and collapsing them would attribute one to the
// other.
function dedupeSources(chunks: ContextChunk[]): SourceRef[] {
  const seen = new Map<string, SourceRef>()
  for (const chunk of chunks) {
    seen.set(`${chunk.origin}:${chunk.label}`, { label: chunk.label, origin: chunk.origin })
  }
  return [...seen.values()]
}

const libraryChunk = (hit: LibraryHit): ContextChunk => ({
  text: hit.content,
  origin: hit.sourceType,
  label: hit.title,
  score: hit.score,
})

async function readCorpus(query: string, topK: number): Promise<ContextChunk[]> {
  try {
    // The raw contexts, not retrieveCorpusContext's joined block. Fusion needs
    // each chunk to hold its own rank, and each one carries its own source
    // document — collapsing them to one string loses both.
    const contexts = await retrieveContexts(query, { topK })

    const chunks = contexts
      .filter((context) => context.text.trim().length > 0)
      .map((context) => ({
        text: context.text,
        origin: 'corpus' as const,
        label: context.sourceDisplayName ?? 'Baza wiedzy',
        score: context.score,
      }))

    // A corpus that missed is not thin grounding, it is none. Returning its
    // least-bad chunks reserved two thirds of the context for medical text on a
    // sociology question, and left hasCanonical true so nothing downstream knew.
    if (isCorpusMiss(chunks)) {
      const best = Math.min(...chunks.map((chunk) => chunk.score ?? Infinity))
      console.log(
        `[retrieval] corpus miss (best ${best.toFixed(3)} > ${CORPUS_MISS_DISTANCE}), dropping ${chunks.length} chunks`
      )
      return []
    }

    return chunks
  } catch (error) {
    // One of two sources. Losing it should degrade the answer, not fail a
    // request the library could still serve.
    console.error('[retrieval] Corpus search failed:', error)
    return []
  }
}

async function readPersonal(userId: string, query: string): Promise<ContextChunk[]> {
  try {
    return (await retrieveLibrary(userId, query, { topK: LIB_TOP_K })).map(libraryChunk)
  } catch (error) {
    console.error('[retrieval] Personal library search failed:', error)
    return []
  }
}

/**
 * The one way every feature reads context.
 *
 * The mode is the feature's declaration of what it may see, so the tier table in
 * CLAUDE.md is executable rather than documentary — a generator that must not
 * read the personal library says `canonical_only` at the call site, where a
 * reviewer sees it.
 */
export async function retrieveContext({
  userId,
  query,
  mode,
  attachmentSourceIds,
  limit = RAG_TOP_K,
}: RetrieveContextOptions): Promise<RetrievedContext> {
  const subject = query.trim()

  // The student named this source, so it is the answer's material — whole, not
  // sampled. Retrieving chunks here would quietly turn „@skrypt /podsumuj" into
  // a summary of three passages that happened to match the word "podsumuj".
  if (mode === 'explicit_resource') {
    return getAttachedSourceText(userId, attachmentSourceIds ?? [])
  }

  if (!subject) return EMPTY

  const wantsPersonal = mode === 'canonical_with_personal' && ENABLE_IMPLICIT_PERSONAL_RETRIEVAL

  // Stripped here rather than inside readPersonal so the query the library
  // actually ran is visible to the log alongside the one the student typed.
  const personalQuery = stripQueryFiller(subject)

  const [corpusChunks, personalChunks] = await Promise.all([
    readCorpus(subject, RAG_TOP_K),
    wantsPersonal ? readPersonal(userId, personalQuery) : Promise.resolve([]),
  ])

  // Curriculum takes its allocation before any fusion. Rank fusion alone lets a
  // personal chunk at rank 0 of a short list outscore curriculum at rank 4 of a
  // long one, so the personal ceiling would fill on every request that had
  // anything to put in it.
  const reserved = corpusChunks.slice(0, Math.min(CANONICAL_RESERVED_SLOTS, limit))
  const personalCeiling = Math.max(0, Math.floor(limit * LIB_SLOT_SHARE))

  // Capped independently of how much room is left: a thin corpus yields a
  // shorter context, not one padded out with notes.
  const contested = reciprocalRankFusion(
    [corpusChunks.slice(reserved.length), personalChunks.slice(0, personalCeiling)],
    (chunk) => `${chunk.origin}:${chunk.label}:${chunk.text.slice(0, 64)}`,
    RRF_K
  )

  const chunks = [...reserved, ...contested].slice(0, limit)
  logRetrievalScores(subject, personalQuery, corpusChunks, personalChunks, chunks)

  return {
    chunks,
    sources: dedupeSources(chunks),
    hasCanonical: corpusChunks.length > 0,
  }
}
