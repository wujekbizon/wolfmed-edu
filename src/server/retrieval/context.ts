import 'server-only'
import { RAG_TOP_K } from '@/constants/rag'
import {
  CANONICAL_RESERVED_SLOTS,
  ENABLE_IMPLICIT_PERSONAL_RETRIEVAL,
  LIB_SLOT_SHARE,
  LIB_TOP_K,
  RRF_K,
} from '@/server/library/config'
import { retrieveLibrary, type LibraryHit } from '@/server/library/retrieve'
import { getAttachedSourceText } from '@/server/library/attached-source'
import { retrieveCorpusContext } from '@/server/vertex-rag/context'
import { reciprocalRankFusion } from '@/helpers/reciprocalRankFusion'
import type {
  ContextChunk,
  RetrieveContextOptions,
  RetrievedContext,
} from '@/types/retrievalTypes'

const EMPTY: RetrievedContext = { chunks: [], sources: [], hasCanonical: false }

const libraryChunk = (hit: LibraryHit): ContextChunk => ({
  text: hit.content,
  origin: hit.sourceType,
  label: hit.title,
})

async function readCorpus(query: string): Promise<ContextChunk[]> {
  try {
    const corpus = await retrieveCorpusContext(query)
    if (!corpus) return []

    // retrieveCorpusContext joins its chunks into one numbered block. Split it
    // back apart so each chunk takes its own rank in the fusion.
    return corpus.text
      .split(/\n\n(?=\[\d+\]\s)/)
      .map((part) => part.replace(/^\[\d+\]\s*/, '').trim())
      .filter(Boolean)
      .map((text) => ({
        text,
        origin: 'corpus' as const,
        label: corpus.sources[0] ?? 'Baza wiedzy',
      }))
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

  const [corpusChunks, personalChunks] = await Promise.all([
    readCorpus(subject),
    wantsPersonal ? readPersonal(userId, subject) : Promise.resolve([]),
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

  return {
    chunks,
    sources: [...new Set(chunks.map((chunk) => chunk.label))],
    hasCanonical: corpusChunks.length > 0,
  }
}
