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

// Enhanced blog types
export type BlogStatus = 'draft' | 'published' | 'archived'
export type CommentStatus = 'pending' | 'approved' | 'rejected'

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
  content: string // MDX/Markdown
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
  date: string | null // Legacy field
  createdAt: Date
  updatedAt: Date

  // Relations (populated by queries)
  category?: BlogCategory | null
  tags?: BlogTag[]
  comments?: BlogComment[]
  likes?: BlogLike[]
  _count?: {
    comments: number
    likes: number
  }
}

export interface BlogComment {
  id: string
  content: string
  postId: string
  authorId: string
  authorName: string
  status: CommentStatus
  parentId: string | null
  createdAt: Date
  updatedAt: Date | null
  replies?: BlogComment[]
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

export interface CreateBlogCommentInput {
  content: string
  postId: string
  parentId?: string | null
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
  totalComments: number
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
