import type {
  AiChallengeType,
  GeneratedQuizPlayView,
} from './generatedQuizTypes'
import type { ProcedureProgress } from './challengeTypes'

/** Phases of the AI quiz experience container. */
export type QuizPhase = 'intro' | 'playing' | 'result'

export interface QuizIntroProps {
  challengeType: AiChallengeType
  procedureName: string
  isPremium: boolean
  hasExistingQuiz: boolean
  isGenerating: boolean
  errorMessage?: string | null
  onGenerate: () => void
  onPlayExisting: () => void
}

export interface KnowledgeQuizPlayerProps {
  quiz: GeneratedQuizPlayView
  answers: Record<string, number>
  isSubmitting: boolean
  onSelect: (questionId: string, optionIndex: number) => void
  onSubmit: () => void
}

export interface SpotErrorPlayerProps {
  quiz: GeneratedQuizPlayView
  selectedErrors: string[]
  isSubmitting: boolean
  onToggleStep: (stepId: string) => void
  onSubmit: () => void
}

export interface ScenarioPlayerProps {
  quiz: GeneratedQuizPlayView
  selectedOption: number | null
  isSubmitting: boolean
  onSelect: (optionIndex: number) => void
  onSubmit: () => void
}

/** One reviewed item shown after grading (answers revealed server-side). */
export interface QuizReviewItem {
  id: string
  prompt: string
  correctLabel: string
  selectedLabel: string | null
  isCorrect: boolean
  explanation?: string | null
  /** spot-error only: error category slug (safety, sequence, …) */
  category?: string | null
}

export interface QuizResultProps {
  challengeType: AiChallengeType
  procedureName: string
  score: number
  passed: boolean
  review: QuizReviewItem[]
  isGenerating: boolean
  onRetryNewQuiz: () => void
  backHref: string
}

export interface ChallengesHubProps {
  procedureName: string
  procedureSlug: string
  progress: ProcedureProgress
}
