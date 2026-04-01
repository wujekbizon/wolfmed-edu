export type CellTypes = "note" | "rag" | "draw" | "test" | "flashcard" | "plan" | "media"

export interface Cell {
  id: string
  type: CellTypes
  content: string
}

export interface UserCellsList {
  id: string
  userId?: string
  order: string[]
  cells: Record<string, Cell>
  updatedAt?: Date
  createdAt?: Date
}

export interface MediaCellContent {
  sourceType: 'audio' | 'video'
  title: string
  url: string
  lectureId?: string
  transcript?: string
}

export interface LearningStep {
  number: number
  title: string
  what: string
  why: string
  keyConcepts: string[]
  estimatedMinutes: number
}

export interface LearningPlan {
  topic: string
  goal: string
  prerequisites: string[]
  estimatedTotalMinutes: number
  steps: LearningStep[]
  summary: string
  examRelevance?: string
}