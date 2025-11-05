/**
 * Zod validation schemas for blog-related operations
 */

import { z } from 'zod'
import { isValidSlug } from '@/lib/blogUtils'

// Blog status enum
export const blogStatusEnum = z.enum(['draft', 'published', 'archived'])

// Comment status enum
export const commentStatusEnum = z.enum(['pending', 'approved', 'rejected'])

// Blog post creation schema
export const createBlogPostSchema = z.object({
  title: z
    .string()
    .min(5, 'Tytuł musi mieć co najmniej 5 znaków')
    .max(256, 'Tytuł nie może przekraczać 256 znaków'),

  slug: z
    .string()
    .min(5, 'Slug musi mieć co najmniej 5 znaków')
    .max(256, 'Slug nie może przekraczać 256 znaków')
    .refine((slug) => isValidSlug(slug), {
      message:
        'Slug może zawierać tylko małe litery, cyfry i myślniki (bez polskich znaków)',
    }),

  excerpt: z
    .string()
    .min(50, 'Wstęp musi mieć co najmniej 50 znaków')
    .max(500, 'Wstęp nie może przekraczać 500 znaków'),

  content: z
    .string()
    .min(100, 'Treść musi mieć co najmniej 100 znaków')
    .max(100000, 'Treść nie może przekraczać 100000 znaków'),

  coverImage: z.string().url('Nieprawidłowy URL obrazu').optional().nullable(),

  categoryId: z.string().uuid('Nieprawidłowe ID kategorii').optional().nullable(),

  tags: z
    .array(z.string().uuid('Nieprawidłowe ID tagu'))
    .max(10, 'Możesz dodać maksymalnie 10 tagów')
    .optional(),

  status: blogStatusEnum.default('draft'),

  publishedAt: z.date().optional().nullable(),

  metaTitle: z
    .string()
    .max(60, 'Meta tytuł nie może przekraczać 60 znaków (zalecane dla SEO)')
    .optional(),

  metaDescription: z
    .string()
    .max(160, 'Meta opis nie może przekraczać 160 znaków (zalecane dla SEO)')
    .optional(),

  metaKeywords: z
    .string()
    .max(256, 'Słowa kluczowe nie mogą przekraczać 256 znaków')
    .optional(),
})

// Blog post update schema (all fields optional except ID)
export const updateBlogPostSchema = createBlogPostSchema
  .partial()
  .extend({
    id: z.string().uuid('Nieprawidłowe ID posta'),
  })
  .refine(
    (data) => {
      // Ensure at least one field is being updated
      const fieldsToUpdate = Object.keys(data).filter((key) => key !== 'id')
      return fieldsToUpdate.length > 0
    },
    {
      message: 'Musisz zaktualizować przynajmniej jedno pole',
    }
  )

// Blog post delete schema
export const deleteBlogPostSchema = z.object({
  id: z.string().uuid('Nieprawidłowe ID posta'),
})

// Blog post publish schema
export const publishBlogPostSchema = z.object({
  id: z.string().uuid('Nieprawidłowe ID posta'),
  publishedAt: z.date().optional(),
})

// Blog comment creation schema
export const createBlogCommentSchema = z.object({
  content: z
    .string()
    .min(3, 'Komentarz musi mieć co najmniej 3 znaki')
    .max(1000, 'Komentarz nie może przekraczać 1000 znaków'),

  postId: z.string().uuid('Nieprawidłowe ID posta'),

  parentId: z.string().uuid('Nieprawidłowe ID komentarza nadrzędnego').optional().nullable(),
})

// Blog comment update schema
export const updateBlogCommentSchema = z.object({
  id: z.string().uuid('Nieprawidłowe ID komentarza'),
  content: z
    .string()
    .min(3, 'Komentarz musi mieć co najmniej 3 znaki')
    .max(1000, 'Komentarz nie może przekraczać 1000 znaków')
    .optional(),
  status: commentStatusEnum.optional(),
})

// Blog comment delete schema
export const deleteBlogCommentSchema = z.object({
  id: z.string().uuid('Nieprawidłowe ID komentarza'),
})

// Blog category creation schema
export const createBlogCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Nazwa musi mieć co najmniej 2 znaki')
    .max(100, 'Nazwa nie może przekraczać 100 znaków'),

  slug: z
    .string()
    .min(2, 'Slug musi mieć co najmniej 2 znaki')
    .max(100, 'Slug nie może przekraczać 100 znaków')
    .refine((slug) => isValidSlug(slug), {
      message:
        'Slug może zawierać tylko małe litery, cyfry i myślniki (bez polskich znaków)',
    }),

  description: z
    .string()
    .max(500, 'Opis nie może przekraczać 500 znaków')
    .optional(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Nieprawidłowy kolor (format: #RRGGBB)')
    .default('#ef4444'),

  icon: z.string().max(50, 'Nazwa ikony nie może przekraczać 50 znaków').optional(),

  order: z.number().int().min(0).default(0),
})

// Blog category update schema
export const updateBlogCategorySchema = createBlogCategorySchema
  .partial()
  .extend({
    id: z.string().uuid('Nieprawidłowe ID kategorii'),
  })
  .refine(
    (data) => {
      const fieldsToUpdate = Object.keys(data).filter((key) => key !== 'id')
      return fieldsToUpdate.length > 0
    },
    {
      message: 'Musisz zaktualizować przynajmniej jedno pole',
    }
  )

// Blog category delete schema
export const deleteBlogCategorySchema = z.object({
  id: z.string().uuid('Nieprawidłowe ID kategorii'),
})

// Blog tag creation schema
export const createBlogTagSchema = z.object({
  name: z
    .string()
    .min(2, 'Nazwa musi mieć co najmniej 2 znaki')
    .max(50, 'Nazwa nie może przekraczać 50 znaków'),

  slug: z
    .string()
    .min(2, 'Slug musi mieć co najmniej 2 znaki')
    .max(50, 'Slug nie może przekraczać 50 znaków')
    .refine((slug) => isValidSlug(slug), {
      message:
        'Slug może zawierać tylko małe litery, cyfry i myślniki (bez polskich znaków)',
    }),
})

// Blog tag update schema
export const updateBlogTagSchema = createBlogTagSchema.partial().extend({
  id: z.string().uuid('Nieprawidłowe ID tagu'),
})

// Blog tag delete schema
export const deleteBlogTagSchema = z.object({
  id: z.string().uuid('Nieprawidłowe ID tagu'),
})

// Blog like schema
export const likeBlogPostSchema = z.object({
  postId: z.string().uuid('Nieprawidłowe ID posta'),
})

// Blog unlike schema
export const unlikeBlogPostSchema = z.object({
  postId: z.string().uuid('Nieprawidłowe ID posta'),
})

// Blog post filters schema (for query params)
export const blogPostFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  tagId: z.string().uuid().optional(),
  tagSlug: z.string().optional(),
  status: blogStatusEnum.optional(),
  authorId: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(12).optional(),
  offset: z.number().int().min(0).default(0).optional(),
  sortBy: z
    .enum(['publishedAt', 'viewCount', 'createdAt', 'updatedAt'])
    .default('publishedAt')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
})

// Type exports for use in components and server actions
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>
export type DeleteBlogPostInput = z.infer<typeof deleteBlogPostSchema>
export type PublishBlogPostInput = z.infer<typeof publishBlogPostSchema>

export type CreateBlogCommentInput = z.infer<typeof createBlogCommentSchema>
export type UpdateBlogCommentInput = z.infer<typeof updateBlogCommentSchema>
export type DeleteBlogCommentInput = z.infer<typeof deleteBlogCommentSchema>

export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>
export type UpdateBlogCategoryInput = z.infer<typeof updateBlogCategorySchema>
export type DeleteBlogCategoryInput = z.infer<typeof deleteBlogCategorySchema>

export type CreateBlogTagInput = z.infer<typeof createBlogTagSchema>
export type UpdateBlogTagInput = z.infer<typeof updateBlogTagSchema>
export type DeleteBlogTagInput = z.infer<typeof deleteBlogTagSchema>

export type LikeBlogPostInput = z.infer<typeof likeBlogPostSchema>
export type UnlikeBlogPostInput = z.infer<typeof unlikeBlogPostSchema>

export type BlogPostFiltersInput = z.infer<typeof blogPostFiltersSchema>
