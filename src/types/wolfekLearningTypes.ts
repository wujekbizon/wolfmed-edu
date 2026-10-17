export type WolfekLearningMode = 'hint' | 'compare' | 'explain'
import type { WolfekQuestionState } from './wolfekResponseTypes'
import type { TutorContextMessage } from './memoryTypes'
import type { SourceRef } from './retrievalTypes'

export type WolfekGeneratedHelp = { answer: string; sources: SourceRef[]; grounded: boolean }

export type WolfekLearningEntry = {
  replies: Partial<Record<WolfekLearningMode, WolfekQuestionState>>
  latest: WolfekLearningMode
  current: WolfekQuestionState
  messages: TutorContextMessage[]
  updatedAt: number
}
export type WolfekLearningStore = {
  entries: Record<string, WolfekLearningEntry>
  latestByCard: Record<string, string>
  hydrated: boolean
  setHydrated: () => void
  saveReply: (key: string, mode: WolfekLearningMode, state: WolfekQuestionState) => void
  selectReply: (key: string, mode: WolfekLearningMode) => void
}
