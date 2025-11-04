// Challenge Types for Procedural Learning System

export enum ChallengeType {
  ORDER_STEPS = 'order-steps',
  KNOWLEDGE_QUIZ = 'knowledge-quiz',
  VISUAL_RECOGNITION = 'visual-recognition',
  SPOT_ERROR = 'spot-error',
  SCENARIO_BASED = 'scenario-based',
}

export const CHALLENGE_TYPE_LABELS: Record<ChallengeType, string> = {
  [ChallengeType.ORDER_STEPS]: 'Uporządkuj kroki',
  [ChallengeType.KNOWLEDGE_QUIZ]: 'Quiz wiedzy',
  [ChallengeType.VISUAL_RECOGNITION]: 'Rozpoznawanie wizualne',
  [ChallengeType.SPOT_ERROR]: 'Znajdź błąd',
  [ChallengeType.SCENARIO_BASED]: 'Scenariusz kliniczny',
}

// Challenge completion data
export interface ChallengeCompletion {
  completed: boolean
  completedAt: string
  score: number
  timeSpent: number // in seconds
  attempts: number
}

// Badge data
export interface Badge {
  earned: boolean
  earnedAt: string
  procedureId: string
  procedureName: string
  badgeImageUrl: string // Placeholder for now, UploadThing URL later
}

// Progress for a specific procedure
export interface ProcedureProgress {
  procedureId: string
  procedureName: string
  completions: Partial<Record<ChallengeType, ChallengeCompletion>>
  totalCompleted: number
  badgeEarned: boolean
}

// Quiz-specific types
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // index of correct option
  explanation?: string
}

export interface QuizChallenge {
  procedureId: string
  procedureName: string
  questions: QuizQuestion[]
}

// Visual recognition types
export interface VisualRecognitionChallenge {
  procedureId: string
  procedureName: string
  image: string
  question: string
  options: string[]
  correctAnswer: number
}

// Spot error types
export interface SpotErrorChallenge {
  procedureId: string
  procedureName: string
  steps: Array<{
    id: string
    step: string
    isCorrect: boolean
    explanation?: string
  }>
}

// Scenario-based types
export interface ScenarioChallenge {
  procedureId: string
  procedureName: string
  scenario: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

// Generic challenge data union type
export type ChallengeData =
  | QuizChallenge
  | VisualRecognitionChallenge
  | SpotErrorChallenge
  | ScenarioChallenge

// Storage key patterns
export const STORAGE_KEYS = {
  challenge: (userId: string, procedureId: string, type: ChallengeType) =>
    `challenge:${userId}:${procedureId}:${type}`,
  badge: (userId: string, procedureId: string) => `badge:${userId}:${procedureId}`,
  progress: (userId: string) => `progress:${userId}`,
  attempts: (userId: string, procedureId: string, type: ChallengeType) =>
    `attempts:${userId}:${procedureId}:${type}`,
} as const

// Server action result type
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }
