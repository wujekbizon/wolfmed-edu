export interface GeneratedAnswer {
  option: string
  isCorrect: boolean
}

export interface GeneratedQuestion {
  data: {
    question: string
    answers: GeneratedAnswer[]
  }
  meta: {
    course: string
    category: string
  }
}
