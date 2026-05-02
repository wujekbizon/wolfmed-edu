export interface PielegniastwoStep {
  number: number
  step: string
  points: number
}

export interface PielegniastwoSection {
  title: string
  steps: PielegniastwoStep[]
}

export interface PielegniastwoProcedure {
  id: string
  meta: {
    course: string
    category: string
  }
  name: string
  executionTime: string
  totalPoints: number
  passingPoints: number
  sections: PielegniastwoSection[]
  notes?: string
  createdAt: string
}
