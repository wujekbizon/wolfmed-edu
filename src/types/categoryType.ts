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
}
