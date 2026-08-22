export interface TestMigrationRecord {
  id: string
  meta: {
    course: string
    category: string
  }
  data: {
    question: string
    answers: Array<{ option: string; isCorrect: boolean }>
  }
  createdAt?: string | null
  updatedAt?: string | null
}

export interface StagedTestRecord {
  id: string
  meta: TestMigrationRecord['meta']
  data: TestMigrationRecord['data']
  created_at: string | null
  updated_at: string | null
}
