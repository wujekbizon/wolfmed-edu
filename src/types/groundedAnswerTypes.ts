import type { TutorContextMessage } from './memoryTypes'

export interface GroundedAnswerOptions {
  maxOutputTokens?: number
  userContext?: string | undefined
  memoryTail?: string | undefined
  memoryPrefix?: string | undefined
  practiceContext?: string | undefined
  recentMessages?: TutorContextMessage[] | undefined
}
