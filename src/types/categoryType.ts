export interface PopulatedCategories {
  category: string
  value: string
  count: number
  data?: CategoryMetadata
  hasAccess?: boolean
  lockedReason?: string
}

export interface CategoryPageProps {
  params: Promise<{ value: string }>
  searchParams: Promise<{ sessionId: string }>
}

export type AccessTier = "free" | "basic" | "premium" | "pro"

export interface CategoryDetails {
  ects: number
  semester: string
  objectives: string
  prerequisites: string
  learningOutcomes: {
    knowledge: Array<{ code: string; desc: string }>
    skills: Array<{ code: string; desc: string }>
    competencies?: Array<{ code: string; desc: string }>
  }
  programContent: {
    lectures: string[]
    seminars: string[]
    selfStudy: string[]
  }
}

export interface CategoryMetadata {
  category: string
  course: string
  requiredTier: AccessTier
  image: string
  description: string
  duration: number[]
  popularity: string
  status: boolean
  numberOfQuestions: number[]
  title?: string
  keywords?: string[]
  details?: CategoryDetails
}
