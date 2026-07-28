export interface TimelinePoint {
  date: string
  avgScore: string | null
  testsCount: number
  studyMinutes: number
}

export interface ProblematicQuestion {
  questionId: string
  questionText: string
  category: string
  correctAnswer: string
  timesAnswered: number
  timesCorrect: number
  accuracy: number
  errorRate: number
}
