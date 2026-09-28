import type { ReactNode } from 'react'
import type { WolfekAnswerReaction, WolfekGaze } from './wolfekTypes'
import type {
  JevSupportAction, LearningQuestionCardData, PracticeCardProgress, PracticeCompanionMode,
  PracticeFormState, PracticeTutorAttachment, PracticeView,
} from './learningPracticeTypes'

export interface LearningDeckProps {
  questions: LearningQuestionCardData[]
  category: string
  userId: string
  initialSession: PracticeView | null
  premium: boolean
}
export interface LearningDeckNavigationProps {
  questions: LearningQuestionCardData[]
  filtered: LearningQuestionCardData[]
  pageQuestions: LearningQuestionCardData[]
  session: PracticeView | null
  questionId: string | undefined
  page: number
  perPage: number
  onFocus: (id: string | null) => void
  onCompare: (id: string | null) => void
  onFilter: (filter: LearningCardFilter) => void
}
export interface LearningDeckHeaderProps { count: number; actions?: ReactNode }
export interface PracticeCompanionAvatarProps {
  session: PracticeView | null
  interactive?: boolean
  reaction?: WolfekAnswerReaction | null
  gaze?: WolfekGaze
}
export type LearningCardFilter = 'all' | 'new' | 'review' | 'mastered'
export type LearningCardFilterCounts = Record<LearningCardFilter, number>
export interface LearningCardFiltersProps {
  value: LearningCardFilter
  counts: LearningCardFilterCounts
  onChange: (value: LearningCardFilter) => void
}
export interface ResetLearningProgressProps {
  userId: string
  category: string
  session: PracticeView
  onReset: (view: PracticeView) => void
}
export interface PracticeQuestionCardProps {
  userId: string
  category: string
  question: LearningQuestionCardData
  number: number
  session: PracticeView | null
  progress: PracticeCardProgress | undefined
  active?: boolean
  comparing?: boolean
  onFocus: () => void
  onSaved: (session: PracticeView) => void
  onAnswered: (question: NonNullable<PracticeView['question']>) => void
}
export interface WolfekCompanionProps {
  userId: string
  category: string
  session: PracticeView | null
  premium: boolean
  onSaved: (session: PracticeView) => void
  onAskTutor: () => void
  onContinue: () => boolean
  onReview: () => boolean
  canContinue: boolean
  onCompare?: () => void
  onMinimize: () => void
  smallTalkIndex: number
  reaction: WolfekAnswerReaction | null
}
export interface WolfekDockProps {
  userId: string
  questionId: string | undefined
  session: PracticeView | null
  children: (minimize: () => void, smallTalkIndex: number) => ReactNode
  reaction: WolfekAnswerReaction | null
}
export interface PracticeCompanionActionsProps {
  mode: PracticeCompanionMode
  premium: boolean
  answerVisible: boolean
  suggestedAction: JevSupportAction | null
  enabled: boolean
  resolved: boolean
  pending: boolean
  onMode: (mode: PracticeCompanionMode) => void
  onHint: () => void
  onAskTutor: () => void
  onCompare?: () => void
}
export interface WolfekBubbleProps {
  session: PracticeView | null
  mode: PracticeCompanionMode
  premium: boolean
  pending: boolean
  onRecommend: () => void
  onDismiss: () => void
  onNavigate: () => void
}
export interface PracticeTutorProps {
  reference: PracticeTutorAttachment
  category: string
  onClose: () => void
}
export interface PracticeTutorHandoffProps {
  session: PracticeView | null
  state: PracticeFormState
  premium: boolean
  pending: boolean
  onAskTutor: () => void
  onReveal: () => boolean
}
