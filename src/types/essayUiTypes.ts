import type { EssayBrief, EssayBriefProps, EssayDraft, EssayMaterial, EssayPlanProps, EssaySection, EssayLexicalNode } from './essayTypes'
import type { Cell } from './cellTypes'
import type { SourceRef } from './retrievalTypes'

export type EssayCellProps = { cell: Cell }
export type EssayBriefFormProps = EssayBriefProps & { cellId: string; input: string }
export type EssayPlanFormProps = EssayPlanProps & { input: string }
export type EssaySourcesProps = { sources: SourceRef[] }
export type EssayDownloadProps = { draft: EssayDraft }
export type EssayPdfNodeProps = { node: EssayLexicalNode }
export type EssayPdfDocumentProps = { topic: string; root: EssayLexicalNode; sources: SourceRef[] }

export type EssayMaterialsProps = {
  cellId: string
  brief: EssayBrief
  onChange: (brief: EssayBrief) => void
}
export type EssaySectionRowProps = {
  section: EssaySection
  index: number
  count: number
  onChange: (section: EssaySection) => void
  onMove: (offset: number) => void
  onRemove: () => void
  disabled: boolean
}
export type EssayMaterialRowProps = {
  material: EssayMaterial
  course: string
  selected: boolean
  onToggle: () => void
}
export type EssayDocumentProps = { draft: EssayDraft; onChange: (content: string) => void }
