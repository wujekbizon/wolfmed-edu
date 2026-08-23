export type TutorIntent = 'self_state' | 'medical_question' | 'ambiguous'

export interface TutorIntentClassification {
  intent: TutorIntent
  confidence: number
}

export interface ModelTokenUsage {
  inputTokens: number
  outputTokens: number
  thoughtTokens: number
  totalTokens: number
}

export interface TutorContextMessage {
  role: 'user' | 'assistant'
  text: string
}

export type TutorIntentResult =
  | {
      status: 'classified'
      classification: TutorIntentClassification
      usage?: ModelTokenUsage
    }
  | { status: 'unavailable' }

export type TutorRoute = 'memory' | 'rag' | 'clarify'

export interface TutorTraceContext {
  runId: string
  userId: string
  turnIndex: number
}

export interface TutorRetrievalTraceInput extends TutorTraceContext {
  route: TutorRoute
  memoryStatus?: 'ready' | 'empty' | 'unavailable'
  memoryCounts?: { facts: number; preferences: number; episodes: number }
  sources?: Array<{ label: string; origin: string }>
}

export interface TutorModelTraceInput extends TutorTraceContext {
  answer: string
  latencyMs: number
  tokenUsage?: ModelTokenUsage
}

export interface FactCandidate {
  userId: string
  subject: string
  predicate: string
  content: string
  source: FactSource
  sourceRunId: string
  confidence: number
  factKey?: string
  metadata?: Record<string, unknown>
  embedding?: number[] | null
  hasSecondObservation?: boolean
  expiresAt?: Date | null
}

export interface PreparedFactCandidate {
  contentHash: string
  status: 'active' | 'provisional'
  metadata: Record<string, unknown> | null
}

export type StoredFactCandidate =
  | { outcome: 'duplicate'; factId: string }
  | { outcome: 'stored'; factId: string; reactivated: boolean }

export type PromotionResult =
  | { outcome: 'inserted'; factId: string; status: FactStatus; superseded: string[] }
  | { outcome: 'reactivated'; factId: string; status: 'active'; superseded: string[] }
  | { outcome: 'duplicate'; factId: string }

export interface DiagnozyMemoryEventInput {
  userId: string
  attemptId: string
  diagnozaSlug: string
  embed?: boolean
}

export interface ChallengeMemoryEventInput {
  userId: string
  completionId: string
  procedureId: string
  procedureName: string
  challengeType: string
  currentScore: number
  attempts: number
  embed?: boolean
}

export interface StudyLogMemoryEventInput {
  userId: string
  studyLogId: string
  embed?: boolean
}

export interface QuizMemoryEventInput {
  userId: string
  sessionId: string
  category: string
  embed?: boolean
}

export interface NewMemoryEpisode {
  userId: string
  taskType: string
  title: string
  summary: string
  outcome: string
  sourceRunId: string
  keySteps?: unknown
  artifacts?: unknown
  embedding?: number[] | null
}

export interface MemoryReconciliationResult {
  attempted: boolean
  complete: boolean
}

export type SelfStateContextResult =
  | {
      status: 'ready'
      context: string
      counts: { facts: number; preferences: number; episodes: number }
    }
  | { status: 'empty' }
  | { status: 'unavailable' }
import type { FactSource, FactStatus } from '@/server/memory/stores/facts'
