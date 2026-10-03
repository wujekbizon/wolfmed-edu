import 'server-only'
import { RAG_TOP_K } from '@/constants/rag'
import {
  CANONICAL_RESERVED_SLOTS,
  ENABLE_IMPLICIT_PERSONAL_RETRIEVAL,
  LIB_SLOT_SHARE,
  RRF_K,
} from '@/server/library/config'
import { getAttachedSourceText } from '@/server/library/attached-source'
import { reciprocalRankFusion } from '@/helpers/reciprocalRankFusion'
import { logRetrievalScores } from '@/helpers/logRetrievalScores'
import { stripQueryFiller } from '@/helpers/stripQueryFiller'
import { dedupeContextSources } from '@/helpers/dedupeContextSources'
import { readCorpus } from './readCorpus'
import { readPersonal } from './readPersonal'
import type { RetrieveContextOptions, RetrievedContext } from '@/types/retrievalTypes'

const EMPTY: RetrievedContext = { chunks: [], sources: [], hasCanonical: false }

export async function retrieveContext({
  userId,
  query,
  mode,
  attachmentSourceIds,
  limit = RAG_TOP_K,
  corpusRelevance = 'distance',
}: RetrieveContextOptions): Promise<RetrievedContext> {
  if (corpusRelevance === 'model' && mode !== 'canonical_only') {
    throw new Error('Model relevance requires canonical_only retrieval')
  }
  if (mode === 'explicit_resource') {
    return getAttachedSourceText(userId, attachmentSourceIds ?? [])
  }

  const subject = query.trim()
  if (!subject) return EMPTY

  const wantsPersonal = mode === 'canonical_with_personal' && ENABLE_IMPLICIT_PERSONAL_RETRIEVAL
  const personalQuery = stripQueryFiller(subject)
  const [corpusChunks, personalChunks] = await Promise.all([
    readCorpus(subject, RAG_TOP_K, corpusRelevance),
    wantsPersonal ? readPersonal(userId, personalQuery) : Promise.resolve([]),
  ])

  const reserved = corpusChunks.slice(0, Math.min(CANONICAL_RESERVED_SLOTS, limit))
  const personalCeiling = Math.max(0, Math.floor(limit * LIB_SLOT_SHARE))
  const contested = reciprocalRankFusion(
    [corpusChunks.slice(reserved.length), personalChunks.slice(0, personalCeiling)],
    (chunk) => `${chunk.origin}:${chunk.label}:${chunk.text.slice(0, 64)}`,
    RRF_K
  )
  const chunks = [...reserved, ...contested].slice(0, limit)
  logRetrievalScores(subject, personalQuery, corpusChunks, personalChunks, chunks)

  return {
    chunks,
    sources: dedupeContextSources(chunks),
    hasCanonical: corpusChunks.length > 0,
  }
}
