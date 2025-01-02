export interface ExamPeriod {
  startDate: Date
  endDate: Date
  type: 'countdown' | 'in_progress' | 'waiting_results'
  label: string
}

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface ExamStatus {
  timeLeft: TimeLeft
  currentPeriod: ExamPeriod | null
}
