import 'server-only'
import { createHash } from 'node:crypto'
import { retrieveContext } from '@/server/retrieval/context'
import { dedupeContextSources } from '@/helpers/dedupeContextSources'
import { ESSAY_CONTEXT_CHARS } from '@/constants/essay'
import type { EssayBrief } from '@/types/essayTypes'
import type { ContextChunk } from '@/types/retrievalTypes'

export async function collectEssayContext(userId: string, brief: EssayBrief, topics: string[]) {
  const queries = [...new Set([brief.topic, ...topics].map((topic) => topic.trim()).filter(Boolean))]
  const unique = new Map<string, ContextChunk>()
  const initial = await retrieveContext({
    userId, query: brief.topic, mode: 'canonical_with_explicit_resources', attachmentSourceIds: brief.materialIds,
  })
  for (const chunk of initial.chunks) unique.set(`${chunk.origin}:${chunk.label}:${chunk.text}`, chunk)
  for (let offset = 1; offset < queries.length; offset += 2) {
    const results = await Promise.all(queries.slice(offset, offset + 2).map((query) => retrieveContext({
      userId, query, mode: 'canonical_with_explicit_resources',
    })))
    for (const context of results) {
      for (const chunk of context.chunks) unique.set(`${chunk.origin}:${chunk.label}:${chunk.text}`, chunk)
    }
  }
  const chunks = [...unique.values()]
  if (chunks.reduce((total, chunk) => total + chunk.text.length, 0) > ESSAY_CONTEXT_CHARS) {
    throw new Error('Materiały są zbyt obszerne. Wybierz mniej plików lub zawęź temat.')
  }
  const attached = chunks.filter((chunk) => chunk.origin === 'material')
  const materialFingerprint = createHash('sha256').update(JSON.stringify({ ids: brief.materialIds, attached })).digest('hex')
  return { chunks, sources: dedupeContextSources(chunks), materialFingerprint }
}
