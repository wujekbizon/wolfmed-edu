import type { FormState } from './actionTypes'

export type PracticeOutcome = 'unassisted' | 'assisted' | 'revealed' | 'skipped' | 'invalid'
export type PracticeCommand = 'answer' | 'hint' | 'reveal' | 'skip' | 'next' | 'finish'
export type PracticeCompanionMode = 'welcome' | 'hint' | 'compare' | 'chat'
export type PracticeSuggestionInteraction = 'accepted' | 'dismissed'
export type JevSupportAction = 'hint' | 'compare' | 'retry' | 'reveal' | 'tutor' | 'material' | 'plan' | 'continue'

export interface PracticeItem {
  id: string
  revision: string
  attempts: { selected: number; correct: boolean; assisted: boolean; eventId: string }[]
  hintOpened: boolean
  revealed: boolean
  correctIndex?: number | null
  priorExposure: boolean
  learningEventId?: string
  support?: { trigger: string; hintIndex: number; specVersion?: string; action?: JevSupportAction | null; mode?: 'shadow' | 'active';
    target?: { label: string; href: string } | null } | undefined
  version: number
  outcome: PracticeOutcome | null
}

export interface PracticeCardProgress {
  id: string
  revision: string
  version: number
  selected: number | null
  correct: boolean | null
  correctIndex: number | null
  attempts: number
  hintOpened: boolean
  priorExposure: boolean
  resolved: boolean
  invalid: boolean
  hint: string | null
  explanation: string | null
  attemptId: string | null
  suggestedAction: JevSupportAction | null
  suggestedTarget: { label: string; href: string } | null
  suggestedEventId: string | null
  outcome: PracticeOutcome | null
}

export interface PracticeView {
  id: string
  partial?: boolean
  category: string
  startedAt: string
  version: number
  index: number
  total: number
  status: 'active' | 'completed' | 'abandoned'
  cards: PracticeCardProgress[]
  question: {
    id: string
    revision: string
    text: string
    options: string[]
    selected: number | null
    correct: boolean | null
    correctIndex: number | null
    attempts: number
    hintOpened: boolean
    resolved: boolean
    invalid: boolean
    hint: string | null
    explanation: string | null
    attemptId: string | null
    supportPending: boolean
    suggestedAction: JevSupportAction | null
    suggestedTarget: { label: string; href: string } | null
    suggestedEventId: string | null
  } | null
  summary: Record<PracticeOutcome, number>
}

export interface LearningQuestionCardData {
  id: string
  revision: string
  question: string
  options: string[]
  practiceable: boolean
}

export type PracticeFormState = FormState & { session: PracticeView | null }
export type PracticeResetInput = { category: string; sessionId: string; eventId: string; version: number }
export type PracticeActionInput = {
  sessionId: string
  eventId: string
  version: number
  command: PracticeCommand
  questionId?: string | undefined
  selected?: number | undefined
}

export interface PracticeReference {
  sessionId: string
  questionId: string
  questionRevision: string
  attemptId: string | null
  purpose: 'explain' | 'follow_up'
}

export type PracticeTutorAttachment = PracticeReference & { questionNumber: number }

export interface LearningCategoryProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ mode?: string }>
}

export interface ReviewedPracticeSupport {
  questionId: string
  revision: string
  topic: string
  hints: string[]
  explanation: string | null
  source: string
  reviewer: string
  reviewedAt: string
  material?: { label: string; href: string }
}
