// tests related types
type Answer = {
  option: string
  isCorrect: boolean
}

interface TestData {
  question: string
  answers: Answer[]
}

export interface Test {
  id: string
  data: TestData
  category: string
  createdAt: Date
  updatedAt: Date | null
}

// Create a custom type that uses the Omit utility type to exclude the data property
// from TestsData and then adds it back with the type unknown.
// this is because Drizzle doesn't support typed JSON in their schemas
export type ExtendedTest = Omit<Test, 'data'> & { data: unknown }

// procedures related types
type Step = {
  step: string
}

interface ProcedureData {
  name: string
  procedure: string
  algorithm: Step[]
}

export interface Procedure {
  data: ProcedureData
}

export type ServerData = Procedure[] | Test[]
export type QuestionAnswer = Record<string, string>
export type FormattedAnswer = { questionId: string; answer: boolean }

export interface CompletedTest {
  completedAt?: Date
  id?: string
  userId: string
  score: number
  testResult: FormattedAnswer[]
}

export type ExtendedCompletedTest = Omit<CompletedTest, 'testResult'> & {
  testResult: unknown
}

export interface UserData {
  userId: string
  imageUrl: string
  createdAt?: Date
  updatedAt: Date
}
