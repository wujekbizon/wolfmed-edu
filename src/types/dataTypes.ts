
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

export type ProcedureStatus = 'normal' | 'ukończone' | 'trudne'

// procedures related types
export type Step = {
  step: string
}

interface ProcedureData {
  name: string
  image:string
  procedure: string
  algorithm: Step[]
}

export interface Procedure {
  id: string
  data: ProcedureData
}
export type ExtendedProcedures = Omit<Procedure, 'data'> & { data: unknown }

export type ServerData = Procedure[] | Test[]
export type QuestionAnswer = Record<string, string>
export type FormattedAnswer = { questionId: string; answer: boolean }

export interface CompletedTest {
  completedAt?: Date
  id: string
  userId: string
  score: number
  sessionId: string | null
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

// Enhanced blog types
export type BlogStatus = 'draft' | 'published' | 'archived'

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  icon: string | null
  order: number
  createdAt: Date
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  createdAt: Date
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  categoryId: string | null
  authorId: string
  authorName: string
  status: BlogStatus
  publishedAt: Date | null
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  viewCount: number
  readingTime: number | null
  date: string | null
  createdAt: Date
  updatedAt: Date

  category?: BlogCategory | null
  tags?: BlogTag[]
  likes?: BlogLike[]
  _count?: {
    likes: number
  }
}

export interface BlogLike {
  userId: string
  postId: string
  createdAt: Date
}

export interface BlogPostTag {
  postId: string
  tagId: string
}

// Form input types
export interface CreateBlogPostInput {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string | null
  categoryId?: string | null
  tags?: string[]
  status: BlogStatus
  publishedAt?: Date | null
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  id: string
}

export interface CreateBlogCategoryInput {
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  order?: number
}

export interface CreateBlogTagInput {
  name: string
  slug: string
}

// Query filter types
export interface BlogPostFilters {
  categoryId?: string
  categorySlug?: string
  tagId?: string
  tagSlug?: string
  status?: BlogStatus
  authorId?: string
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'publishedAt' | 'viewCount' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// Statistics type
export interface BlogStatistics {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  archivedPosts: number
  totalViews: number
  totalLikes: number
  totalCategories: number
  totalTags: number
}

export type PostProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export interface StepWithId extends Step {
  id: string
}

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

