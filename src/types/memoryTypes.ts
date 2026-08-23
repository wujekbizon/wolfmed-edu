export type TutorIntent = 'self_state' | 'medical_question' | 'ambiguous'

export interface TutorIntentClassification {
  intent: TutorIntent
  confidence: number
}

export type TutorIntentResult =
  | { status: 'classified'; classification: TutorIntentClassification }
  | { status: 'unavailable' }

export type TutorRoute = 'memory' | 'rag' | 'clarify'

export type SelfStateContextResult =
  | { status: 'ready'; context: string }
  | { status: 'empty' }
  | { status: 'unavailable' }
