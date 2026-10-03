import type { MindMapDraftNode, MindMapGeneratedNode } from '@/types/mindmapGenerationTypes'

export function buildMindMapDraft(nodes: MindMapGeneratedNode[]): MindMapDraftNode {
  if (!nodes.length || nodes[0]!.parentIndex !== null) {
    throw new Error('Pierwszy węzeł musi być korzeniem z parentIndex: null.')
  }
  const drafts: MindMapDraftNode[] = []
  nodes.forEach((node, index) => {
    const parent = node.parentIndex
    if (index > 0 && (parent === null || !Number.isInteger(parent) || parent < 0 || parent >= index)) {
      throw new Error(`Węzeł ${index}: parentIndex musi wskazywać wcześniejszy węzeł.`)
    }
    const draft: MindMapDraftNode = {
      label: node.label,
      children: [],
      metadata: {
        notes: node.notes,
        ...(node.tags ? { tags: node.tags } : {}),
        ...(node.category ? { category: node.category } : {}),
      },
    }
    drafts.push(draft)
    if (parent !== null) {
      const ancestor = drafts[parent]!
      ancestor.children.push(draft)
    }
  })
  return drafts[0]!
}
