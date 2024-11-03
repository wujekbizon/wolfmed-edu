import { Usable } from 'react'

// tests related types
type Answer = {
  option: string
  isCorrect: boolean
}

export interface TestData {
  question: string
  answers: Answer[]
}

export interface Test {
  id: string
  data: TestData
  category: string
  createdAt?: Date | null
  updatedAt?: Date | null
}

// Create a custom type that uses the Omit utility type to exclude the data property
// from TestsData and then adds it back with the type unknown.
// this is because Drizzle doesn't support typed JSON in their schemas
export type ExtendedTest = Omit<Test, 'data'> & { data: unknown }

// procedures related types
export type Step = {
  step: string
}

interface ProcedureData {
  name: string
  procedure: string
  algorithm: Step[]
}

export interface Procedure {
  id: string
  data: ProcedureData
}
export type ExtendedProcedures = Omit<Procedure, 'data'> & { data: unknown }

export type ServerData = Procedure[] | Test[] | Post[]
export type QuestionAnswer = Record<string, string>
export type FormattedAnswer = { questionId: string; answer: boolean }

export interface CompletedTest {
  completedAt?: Date
  id: string
  userId: string
  score: number
  testResult: FormattedAnswer[]
}

export type ExtendedCompletedTest = Omit<CompletedTest, 'testResult'> & {
  testResult: unknown
}

export interface UserData {
  userId: string
  username?: string
  motto?: string
  createdAt?: Date
}

export interface Post {
  id: string
  title: string
  date: string
  excerpt: string
  content: string
  createdAt?: Date | null
  updatedAt?: Date | null
}

export type PostProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export interface StepWithId extends Step {
  id: string
}

// Add this to your existing types
export interface User {
  id: string
  userId: string
  testLimit: number
  createdAt: string
  updatedAt: string | null
  motto: string
  supporter: boolean
  username: string
  tests_attempted: number
  total_score: number
  total_questions: number
}

// Add this to your existing types
export interface CompletedTestData {
  id: string
  userId: string
  testResult: Array<{
    answer: boolean
    questionId: string
  }>
  score: number
  completedAt: Date | null
}
