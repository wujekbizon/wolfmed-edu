export interface TestSeedRecord {
  id: string
  meta: {
    course: string
    category: string
  }
  data: {
    question: string
    answers: Array<{ option: string; isCorrect?: boolean }>
  }
  createdAt?: string | null
  updatedAt?: string | null
}

export interface StagedTestSeedRecord {
  id: string
  meta: TestSeedRecord['meta']
  data: TestSeedRecord['data']
  created_at: string | null
  updated_at: string | null
}
