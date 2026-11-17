import type { FormState } from './actionTypes'
import type { SourceRef } from './retrievalTypes'

export type EssayCourse = 'pielegniarstwo' | 'opiekun-medyczny'
export type EssayStep = 'brief' | 'plan' | 'text'
export type EssayBrief = {
  course: string
  kind: string
  topic: string
  requirements: string
  additional: string
  materialIds: string[]
}
export type EssaySection = { id: string; title: string; description: string; words: number }
export type EssayDraft = {
  schemaVersion: 1
  brief: EssayBrief
  sections: EssaySection[]
  targetWords: number
  outlineBrief: string
  materialFingerprint: string
  editorContent: string
  documentId: string
  documentTopic: string
  outlineSources: SourceRef[]
  sources: SourceRef[]
  gaps: string[]
}
export type EssayMaterial = {
  id: string
  title: string
  type: string
  url: string
  indexStatus: string
  ready: boolean
  retryable: boolean
}
export type EssayResources = { userId: string; courses: EssayCourse[]; materials: EssayMaterial[] }
export type EssayBriefProps = {
  draft: EssayDraft
  onChange: (brief: EssayBrief) => void
  onResult: (input: string, draft: EssayDraft) => void
}
export type EssayFieldProps = {
  brief: EssayBrief
  onChange: (brief: EssayBrief) => void
  state: FormState
  disabled: boolean
  id: string
}
export type EssayPlanProps = {
  draft: EssayDraft
  onChange: (sections: EssaySection[]) => void
  onResult: (input: string, draft: EssayDraft) => void
  onBack: () => void
}
export type EssayLexicalNode = {
  type: string
  text?: string
  format?: number | string
  tag?: string
  url?: string
  listType?: string
  children?: EssayLexicalNode[]
}
