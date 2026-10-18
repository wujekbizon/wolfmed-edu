import type { ExamQuestion } from '@/types/dataTypes'

export type TestSessionMode = 'EXAM' | 'PRACTICE'

export type TestSessionProgress = Record<string, number>

export type TestSessionQuestionIds = string[]

export type PracticeProgressVersion = { revision: number; clientId: string }
export type PracticeProgressVersions = Record<string, PracticeProgressVersion>
export type PracticeAnswerUpdate = PracticeProgressVersion & { answerIndex: number; baseRevision: number }
export type PracticeAnswerUpdates = Record<string, PracticeAnswerUpdate>
export type PracticeSaveStatus = 'saved' | 'unsaved' | 'saving' | 'error' | 'conflict'
export type PracticeTestsProps = {
  tests: ExamQuestion[]
  sessionId: string
  initialProgress: TestSessionProgress
  initialVersions: PracticeProgressVersions
}

export type TestsByCategoryProps = { category: string; sessionId: string | undefined }
