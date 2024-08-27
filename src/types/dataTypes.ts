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
  data: TestData
  category: string
}

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
