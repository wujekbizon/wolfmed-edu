import 'server-only'
import { RAG_TOP_K } from '@/constants/rag'
import { LIB_SLOT_SHARE, LIB_TOP_K, RRF_K } from '@/server/library/config'
import { retrieveLibrary, type LibraryHit } from '@/server/library/retrieve'
import { retrieveCorpusContext } from '@/server/vertex-rag/context'
import { reciprocalRankFusion } from '@/helpers/reciprocalRankFusion'
import type {
  ContextChunk,
  RetrieveContextOptions,
  RetrievedContext,
} from '@/types/retrievalTypes'

const EMPTY: RetrievedContext = { chunks: [], sources: [] }

function libraryChunk(hit: LibraryHit): ContextChunk {
  return {
    text: hit.content,
    origin: hit.sourceType,
    label: hit.title,
  }
}

async function readCorpus(query: string): Promise<ContextChunk[]> {
  try {
    const corpus = await retrieveCorpusContext(query)
    if (!corpus) return []

    // retrieveCorpusContext joins its chunks into one numbered block. Split it
    // back apart so each chunk can take its own rank in the fusion.
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
    // The corpus is one of two sources. Losing it should degrade the answer,
    // not fail a request the personal library could still serve.
    console.error('[retrieval] Corpus search failed:', error)
    return []
  }
}

async function readPersonal(
  userId: string,
  query: string,
  attachmentSourceIds?: string[]
): Promise<ContextChunk[]> {
  try {
    if (!attachmentSourceIds?.length) {
      return (await retrieveLibrary(userId, query)).map(libraryChunk)
    }

    const perSource = await Promise.all(
      attachmentSourceIds.map((sourceId) =>
        retrieveLibrary(userId, query, { sourceId, topK: LIB_TOP_K })
      )
    )
    return perSource.flat().map(libraryChunk)
  } catch (error) {
    console.error('[retrieval] Personal library search failed:', error)
    return []
  }
}

/**
 * The one way every feature reads context.
 *
 * Sources are explicit flags rather than an options bag, so the tier table in
 * CLAUDE.md is executable: a generator that must not read the personal library
 * says `personal: false` at the call site, where a reviewer sees it.
 *
 * The two sides are merged by rank, never by score — see reciprocalRankFusion.
 * The library is capped at a share of the result so the curriculum stays the
 * authority and a student's own half-written note cannot crowd it out.
 */
export async function retrieveContext({
  userId,
  query,
  corpus = true,
  personal = true,
  attachmentSourceIds,
  limit = RAG_TOP_K,
}: RetrieveContextOptions): Promise<RetrievedContext> {
  const subject = query.trim()
  if (!subject) return EMPTY

  const [corpusChunks, personalChunks] = await Promise.all([
    corpus ? readCorpus(subject) : Promise.resolve([]),
    personal ? readPersonal(userId, subject, attachmentSourceIds) : Promise.resolve([]),
  ])

  // An explicit attachment is the primary source: the student named it, so it is
  // not competing for slots with anything.
  const librarySlots = attachmentSourceIds?.length
    ? limit
    : Math.max(1, Math.floor(limit * LIB_SLOT_SHARE))

  const merged = reciprocalRankFusion(
    [corpusChunks, personalChunks.slice(0, librarySlots)],
    (chunk) => `${chunk.origin}:${chunk.label}:${chunk.text.slice(0, 64)}`,
    RRF_K
  ).slice(0, limit)

  return {
    chunks: merged,
    sources: [...new Set(merged.map((chunk) => chunk.label))],
  }
}
