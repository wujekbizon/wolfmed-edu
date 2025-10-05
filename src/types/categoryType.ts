export interface PopulatedCategories {
  category: string
  value: string
  count: number
  data: CategoryMetadata
}

export interface CategoryPageProps {
  params: Promise<{ value: string }>
}

export interface CategoryMetadata {
  category: string
  image: string
  description: string
  duration: number[]
  popularity: string
  status: boolean
  numberOfQuestions:number[]
}
