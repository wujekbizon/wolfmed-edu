import { MindMapGenerationSchema } from '@/server/mindmapGenerationSchema'
import { MindMapNodeSchema } from '@/server/schema'
import { normalizeTree } from '@/lib/mindmap/normalizeTree'
import { validateTree } from '@/lib/mindmap/validateTree'
import { buildMindMapDraft } from '@/helpers/buildMindMapDraft'
import type { MindMapNode } from '@/types/mindmapTypes'
import type { MindMapGenerationResult } from '@/types/mindmapGenerationTypes'

export function parseMindMapGeneration(text: string): MindMapGenerationResult {
  const response = MindMapGenerationSchema.parse(JSON.parse(text))
  if (response.status === 'no_source') return { status: 'no_source' }

  const draft = buildMindMapDraft(response.nodes)
  draft.metadata = { ...draft.metadata, topicType: response.topicType }
  const normalized = normalizeTree(draft)
  const root = MindMapNodeSchema.parse(normalized) as MindMapNode
  const structure = validateTree(root)
  if (!structure.valid) throw new Error(structure.errors.join('; '))

  return { status: 'map', root, topicType: response.topicType }
}
