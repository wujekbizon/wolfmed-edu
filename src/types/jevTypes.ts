import type { JevSupportAction, PracticeItem } from './learningPracticeTypes'
import type { PracticeObservationSummary, PracticeStreakEvidence } from './learningObservationTypes'

export interface JevConfig {
  mode: 'shadow' | 'active'
  apiKey: string
  dailyLimit: number
  sessionLimit: number
  minConfidence: number | undefined
}
export interface JevCandidate { id: JevSupportAction; text: string }
export interface JevState {
  trigger: 'three_distinct_first_errors'
  currentCard: { attemptCount: number; answerVisible: boolean; hintUsed: boolean;
    comparisonUsed: boolean; verifiedTopic: string | null }
  learningWindow: PracticeStreakEvidence
  practice: Pick<PracticeObservationSummary, 'cards' | 'firstCorrect' | 'firstWrong' |
    'retries' | 'hints' | 'reveals' | 'comparisons' | 'tutorResponses'> &
    { scope: 'last_30_days_up_to_120_events' }
  priorTest: { averagePercent: number; attempts: number; recordedAt: string } | null
  studyActivity?: { sampledEntries: number; sampleMinutes: number; latestAt: string | null; sources: string[] }
  plan: { label: string; pace: string; remainingToday: number } | null
  material: { label: string } | null
  tutorAvailable: boolean
  dismissedActions?: JevSupportAction[]
}
export interface JevDecision {
  choice: string
  probabilities: Record<string, number>
  confidence: number
  inputTokens: number
  outputTokens: number
}
export interface PracticeSupportRequest { category: string; sessionId: string; version: number }
export interface PracticeSupportContext {
  request: PracticeSupportRequest
  item: PracticeItem
  trigger: string
  candidates: JevCandidate[]
  state: JevState
  target: { material: { label: string; href: string } | null; plan: { label: string; href: string } | null }
}
