import type { FormState } from './actionTypes'
import type { PracticeView } from './learningPracticeTypes'
import type { JevRequestPayload } from './jevAuditTypes'

export type WolfekRoute = 'kierunki' | 'panel.home' | 'panel.results' | 'learning.practice'
export type WolfekFacts = Record<string, unknown>
export type WolfekPracticeReference = {
  category: string; sessionId: string | null; version: number; questionId: string; revision: string
}
export type WolfekQuestionRequest = {
  route: WolfekRoute; question: string; origin: 'typed' | 'prepared'
  preparedQuestionId: string | null; submissionId: string; practice: WolfekPracticeReference | null
}
export type WolfekOption = {
  id: string; topic: string | null; covers: string; template: string; requiredFacts: string[]
  conditions: Array<{ path: string; equals: string | boolean | number | null }>
  action: { type: string; destinationKey: string } | null
}
export type WolfekPack = {
  version: string; instructions: unknown; diagnostics: Record<string, unknown>; options: WolfekOption[]
}
export type WolfekAction = {
  type: string; href?: string; targetId?: string; courseSlug?: string
}
export type WolfekAnswer = {
  responseId: string; topic: string | null; text: string; action: WolfekAction | null
}
export type WolfekDecision = {
  responseId: string; confidence: number; clarificationProbability: number; coverage: number
}
export type WolfekQuestionState = FormState & {
  answer: WolfekAnswer | null; confidence: number | null; session?: PracticeView
}
export type WolfekContext = {
  facts: WolfekFacts; destinations: Record<string, WolfekAction>
}
export type WolfekBuiltRequest = {
  payload: JevRequestPayload; answers: Record<string, WolfekAnswer>
}
export type WolfekResponseEvaluator = (
  payload: JevRequestPayload, parse: (raw: unknown) => WolfekDecision | null,
) => Promise<WolfekDecision | null>
export type WolfekQuestionProps = {
  route: WolfekRoute; practice?: WolfekPracticeReference | null
  onAnswer?: (answer: WolfekAnswer) => void
}
export type WolfekQuestionChatProps = WolfekQuestionProps & {
  onAction?: (answer: WolfekAnswer) => void
  onInteraction?: () => void
  onPendingChange?: (pending: boolean) => void
}
export type WolfekQuestionController = {
  state: WolfekQuestionState; pending: boolean; action: (data: FormData) => void
  submitPrepared: (id: string) => void; prepareForm: (data: FormData) => void
}
