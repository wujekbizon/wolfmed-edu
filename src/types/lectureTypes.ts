export interface GeneratedLecture {
  audioUrl: string
  title: string
  transcript: string
  lectureId: string
}

export interface PlanFooterProps {
  summary?: string
  examRelevance?: string | undefined
  isPending: boolean
  lectureGenerated: boolean
  onGenerate: () => void
  onSaveScript?: (() => void) | undefined
}
