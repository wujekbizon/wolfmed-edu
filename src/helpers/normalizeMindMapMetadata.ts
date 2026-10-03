import { CATEGORIES, type MindMapNodeMetadata } from '@/types/mindmapTypes'
import type { MindMapDraftMetadata } from '@/types/mindmapGenerationTypes'

export function normalizeMindMapMetadata(metadata: MindMapDraftMetadata): MindMapNodeMetadata {
  const { category, tags, ...content } = metadata
  const normalizedCategory = category?.trim().toLowerCase()
  const normalizedTags = tags
    ? [...new Set(tags.map(tag => tag.trim().slice(0, 40)).filter(Boolean))].slice(0, 3)
    : undefined
  return {
    ...content,
    category: CATEGORIES.find(value => value === normalizedCategory) ?? 'other',
    ...(normalizedTags ? { tags: normalizedTags } : {}),
  }
}
