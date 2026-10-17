export type PracticeExamResume = {
  sessionId: string
  category: string
  numberOfQuestions: number
  answeredQuestions: number
  lastActivityAt: Date
}

export type LearningSessionResume = {
  sessionId: string
  category: string
  totalQuestions: number
  completedQuestions: number
  lastActivityAt: Date
}
