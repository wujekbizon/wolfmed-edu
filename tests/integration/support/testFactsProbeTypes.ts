export type SyntheticTest = {
  sessionLinked: boolean
  score: number
  category: string
  numberOfQuestions: number
  testResult: Array<{ questionId: string; answer: boolean }>
}

export type TestFactsQuery = {
  kind: 'totals' | 'categories' | 'history'
  fields: string[]
  rows: number
  serializedResultBytes: number
  answerEntries: number
  failed: boolean
}
