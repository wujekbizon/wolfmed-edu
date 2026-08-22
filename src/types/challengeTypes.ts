// Challenge Types for Procedural Learning System

export enum ChallengeType {
  ORDER_STEPS = 'order-steps',
  KNOWLEDGE_QUIZ = 'knowledge-quiz',
  SPOT_ERROR = 'spot-error',
  SCENARIO_BASED = 'scenario-based',
}

export const CHALLENGE_TYPE_LABELS: Record<ChallengeType, string> = {
  [ChallengeType.ORDER_STEPS]: 'Uporządkuj kroki',
  [ChallengeType.KNOWLEDGE_QUIZ]: 'Quiz wiedzy',
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

// Error categories for spot-the-error challenge
export enum ErrorCategory {
  SAFETY = 'safety',           // Safety violations (hygiene, patient ID)
  SEQUENCE = 'sequence',       // Wrong order or timing
  TECHNIQUE = 'technique',     // Wrong technique or method
  OMISSION = 'omission',       // Critical step skipped
  MEASUREMENT = 'measurement', // Wrong size, temperature, dosage
}

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  [ErrorCategory.SAFETY]: 'Bezpieczeństwo',
  [ErrorCategory.SEQUENCE]: 'Kolejność',
  [ErrorCategory.TECHNIQUE]: 'Technika',
  [ErrorCategory.OMISSION]: 'Pominięcie',
  [ErrorCategory.MEASUREMENT]: 'Pomiar',
}

export const ERROR_CATEGORY_COLORS: Record<ErrorCategory, { bg: string; border: string; text: string }> = {
  [ErrorCategory.SAFETY]: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700' },
  [ErrorCategory.SEQUENCE]: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700' },
  [ErrorCategory.TECHNIQUE]: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700' },
  [ErrorCategory.OMISSION]: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700' },
  [ErrorCategory.MEASUREMENT]: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700' },
}

// Server action result type
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }
