import 'server-only'
import { getGoogleAI } from '@/server/vertex-rag/client'
import { retrieveContext } from '@/server/retrieval/context'
import { formatContextChunks } from '@/helpers/formatContextChunks'
import { generateMindMapFromContext } from '@/helpers/generateMindMapFromContext'
import { createMindMapModelGenerator } from '@/helpers/createMindMapModelGenerator'
import { RAG_TOP_K_BROAD } from '@/constants/rag'
import { MINDMAP_TIMEOUT_MS } from '@/constants/mindmapGeneration'
import type { MindMapGenerationResult } from '@/types/mindmapGenerationTypes'

export async function generateTree(userId: string, topic: string): Promise<MindMapGenerationResult> {
  const corpus = await retrieveContext({
    userId,
    query: topic,
    mode: 'canonical_only',
    corpusRelevance: 'model',
    limit: RAG_TOP_K_BROAD,
  })
  if (!corpus.chunks.length) return { status: 'no_source' }

  const context = formatContextChunks(corpus.chunks)
  const ai = getGoogleAI()
  const signal = AbortSignal.timeout(MINDMAP_TIMEOUT_MS)
  const generate = createMindMapModelGenerator((request) => ai.models.generateContent(request), signal)
  return generateMindMapFromContext(topic, context, async (contents) => {
    try {
      return await generate(contents)
    } catch (error) {
      console.error('[mindmap] Model request failed:', error)
      throw new Error(signal.aborted
        ? 'Generowanie mapy trwało zbyt długo. Spróbuj ponownie.'
        : 'Generowanie mapy jest chwilowo niedostępne. Spróbuj ponownie za chwilę.')
    }
  })
}
