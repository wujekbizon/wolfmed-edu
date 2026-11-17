import { EMPTY_ESSAY } from '@/constants/essay'
import type { EssayDraft } from '@/types/essayTypes'

export function parseEssayCellContent(content: string): EssayDraft | null {
  if (!content) return structuredClone(EMPTY_ESSAY)
  try {
    const value = JSON.parse(content) as EssayDraft
    const brief = value.brief
    if (value.schemaVersion !== 1 || !brief) return null
    if (![brief.course, brief.kind, brief.topic, brief.requirements, brief.additional,
      value.outlineBrief, value.materialFingerprint, value.editorContent, value.documentId, value.documentTopic]
      .every((entry) => typeof entry === 'string')) return null
    if (!Array.isArray(brief.materialIds) || !brief.materialIds.every((id) => typeof id === 'string')) return null
    if (!Array.isArray(value.sections) || !value.sections.every((section) => section
      && typeof section.id === 'string' && typeof section.title === 'string'
      && typeof section.description === 'string' && typeof section.words === 'number')) return null
    if (![value.sources, value.outlineSources].every((list) => Array.isArray(list) && list.every((source) => source
      && typeof source.label === 'string' && ['corpus', 'note', 'material'].includes(source.origin)))) return null
    if (!Array.isArray(value.gaps) || !value.gaps.every((gap) => typeof gap === 'string')) return null
    return typeof value.targetWords === 'number' ? value : null
  } catch {
    return null
  }
}
