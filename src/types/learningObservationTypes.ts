export interface PracticeObservation {
  eventId: string
  questionId: string | null
  revision: string | null
  kind: string
  at: string
  attempt: number
  correct: boolean | null
  assisted: boolean
  revealed: boolean
}
export interface PracticeObservationSummary {
  cards: number
  firstCorrect: number
  firstWrong: number
  retries: number
  hints: number
  reveals: number
  comparisons: number
  tutorResponses: number
  lastEventId: string | null
  lastAt: string | null
  recent: Array<{ kind: string; correct: boolean | null; assisted: boolean }>
}
export interface PracticeStreakEvidence {
  scope: 'current_run_since_last_30_minute_gap'
  consecutiveIncorrect: number
  firstAttemptResultsOldestFirst: Array<{ result: 'incorrect' | 'correct'; assisted: boolean }>
}

export interface PracticePriorHelpEvidence {
  kind: 'hint' | 'compare'
  previousCardFirstAttempt: 'incorrect'
  currentCardFirstAttempt: 'incorrect'
  topicRelation: 'unknown'
}

export interface PracticeRevealEvidence {
  scope: 'current_run_last_30_minutes'
  distinctRevealedCards: number
}

export interface PracticeCoachingEvidence {
  trigger: 'three_distinct_first_errors' | 'difficulty_after_help' | 'frequent_reveals'
  learningWindow: PracticeStreakEvidence
  priorHelp: PracticePriorHelpEvidence | null
  revealWindow: PracticeRevealEvidence | null
}
