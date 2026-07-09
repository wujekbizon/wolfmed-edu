export type Category =
  | "anatomy"
  | "physiology"
  | "pathology"
  | "pharmacology"
  | "diagnostics"
  | "treatment"
  | "epidemiology"
  | "genetics"
  | "immunology"
  | "other"

export type TopicType =
  | "disease"
  | "drug"
  | "procedure"
  | "anatomy"
  | "physiology"
  | "syndrome"
  | "concept"
  | "process"
  | "skill"
  | "generic"

export type MasteryLevel = "unseen" | "learning" | "mastered"

export interface MindMapNodeMetadata {
  notes?: string
  tags?: string[]
  quizCount?: number
  masteryLevel?: MasteryLevel
  examTopicId?: string
  category?: Category
  topicType?: TopicType
}

export interface MindMapNode {
  id: string
  label: string
  parentId: string | null
  depth: number
  collapsed?: boolean
  children: MindMapNode[]
  metadata?: MindMapNodeMetadata
}

export interface MindMap {
  id: string
  userId: string
  subjectId: string | null
  title: string
  topicType: TopicType
  root: MindMapNode
  language: string
  createdAt: Date
  updatedAt: Date
}

export const CATEGORIES: readonly Category[] = [
  "anatomy",
  "physiology",
  "pathology",
  "pharmacology",
  "diagnostics",
  "treatment",
  "epidemiology",
  "genetics",
  "immunology",
  "other",
] as const

export const TOPIC_TYPES: readonly TopicType[] = [
  "disease",
  "drug",
  "procedure",
  "anatomy",
  "physiology",
  "syndrome",
  "concept",
  "process",
  "skill",
  "generic",
] as const

export const MAX_DEPTH = 3
export const MAX_CHILDREN = 6
