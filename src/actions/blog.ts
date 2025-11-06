'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db/index'
import { blogPosts, blogPostTags, blogLikes } from '@/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { calculateReadingTime } from '@/lib/blogUtils'
import { requireAdminAction, requireAuth } from '@/lib/adminHelpers'
import {
  CreateBlogPostSchema,
  UpdateBlogPostSchema,
  DeleteBlogPostSchema,
  PublishBlogPostSchema,
  LikeBlogPostSchema,
  UnlikeBlogPostSchema,
} from '@/server/schema'

/**
 * Create a new blog post (Admin only)
 */
export async function createBlogPostAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check admin access
    const admin = await requireAdminAction()

    // Extract data from formData
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const coverImage = formData.get('coverImage') as string | null
    const categoryId = formData.get('categoryId') as string | null
    const status = (formData.get('status') as string) || 'draft'
    const metaTitle = formData.get('metaTitle') as string | null
    const metaDescription = formData.get('metaDescription') as string | null
    const metaKeywords = formData.get('metaKeywords') as string | null

    // Extract tags array (multiple checkboxes with same name)
    const tags = formData.getAll('tags') as string[]

    // Validate input
    const validationResult = CreateBlogPostSchema.safeParse({
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || undefined,
      categoryId: categoryId || undefined,
      tags,
      status,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      metaKeywords: metaKeywords || undefined,
    })

    if (!validationResult.success) {
      return {
        ...fromErrorToFormState(validationResult.error),
        values: { title, slug, excerpt, content, coverImage, categoryId, status },
      }
    }

    const validatedData = validationResult.data

    // Calculate reading time
    const readingTime = calculateReadingTime(validatedData.content)

    // Create post
    const [newPost] = await db
      .insert(blogPosts)
      .values({
        title: validatedData.title,
        slug: validatedData.slug,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        coverImage: validatedData.coverImage || null,
        categoryId: validatedData.categoryId || null,
        authorId: admin.userId,
        authorName: admin.name,
        status: validatedData.status,
        publishedAt: validatedData.status === 'published' ? new Date() : null,
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
        metaKeywords: validatedData.metaKeywords || null,
        readingTime,
        viewCount: 0,
      })
      .returning({ id: blogPosts.id, slug: blogPosts.slug })

    // Add tags if provided
    if (validatedData.tags && validatedData.tags.length > 0 && newPost) {
      await db.insert(blogPostTags).values(
        validatedData.tags.map((tagId) => ({
          postId: newPost.id,
          tagId,
        }))
      )
    }

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return toFormState('SUCCESS', 'Post został utworzony pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Update an existing blog post (Admin only)
 */
export async function updateBlogPostAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check admin access
    await requireAdminAction()

    // Extract data from formData
    const id = formData.get('id') as string
    const title = formData.get('title') as string | null
    const slug = formData.get('slug') as string | null
    const excerpt = formData.get('excerpt') as string | null
    const content = formData.get('content') as string | null
    const coverImage = formData.get('coverImage') as string | null
    const categoryId = formData.get('categoryId') as string | null
    const status = formData.get('status') as string | null
    const metaTitle = formData.get('metaTitle') as string | null
    const metaDescription = formData.get('metaDescription') as string | null
    const metaKeywords = formData.get('metaKeywords') as string | null

    // Extract tags array (multiple checkboxes with same name)
    const tagsArray = formData.getAll('tags') as string[]
    const tags = tagsArray.length > 0 ? tagsArray : undefined

    // Build validation object (only include fields that are present)
    const validationInput: any = { id }
    if (title) validationInput.title = title
    if (slug) validationInput.slug = slug
    if (excerpt) validationInput.excerpt = excerpt
    if (content) validationInput.content = content
    if (coverImage !== null) validationInput.coverImage = coverImage || undefined
    if (categoryId !== null) validationInput.categoryId = categoryId || undefined
    if (tags) validationInput.tags = tags
    if (status) validationInput.status = status
    if (metaTitle !== null) validationInput.metaTitle = metaTitle || undefined
    if (metaDescription !== null) validationInput.metaDescription = metaDescription || undefined
    if (metaKeywords !== null) validationInput.metaKeywords = metaKeywords || undefined

    // Validate input
    const validationResult = UpdateBlogPostSchema.safeParse(validationInput)

    if (!validationResult.success) {
      return {
        ...fromErrorToFormState(validationResult.error),
        values: { id, title, slug, excerpt, content, coverImage, categoryId, status },
      }
    }

    const validatedData = validationResult.data

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.slug) updateData.slug = validatedData.slug
    if (validatedData.excerpt) updateData.excerpt = validatedData.excerpt
    if (validatedData.content) {
      updateData.content = validatedData.content
      updateData.readingTime = calculateReadingTime(validatedData.content)
    }
    if (validatedData.coverImage !== undefined)
      updateData.coverImage = validatedData.coverImage
    if (validatedData.categoryId !== undefined)
      updateData.categoryId = validatedData.categoryId
    if (validatedData.status) {
      updateData.status = validatedData.status
      if (validatedData.status === 'published' && !validatedData.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (validatedData.publishedAt !== undefined)
      updateData.publishedAt = validatedData.publishedAt
    if (validatedData.metaTitle !== undefined)
      updateData.metaTitle = validatedData.metaTitle
    if (validatedData.metaDescription !== undefined)
      updateData.metaDescription = validatedData.metaDescription
    if (validatedData.metaKeywords !== undefined)
      updateData.metaKeywords = validatedData.metaKeywords

    // Update post
    const [updatedPost] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, validatedData.id))
      .returning({ id: blogPosts.id, slug: blogPosts.slug })

    // Update tags if provided
    if (validatedData.tags) {
      // Delete existing tags
      await db.delete(blogPostTags).where(eq(blogPostTags.postId, validatedData.id))

      // Add new tags
      if (validatedData.tags.length > 0) {
        await db.insert(blogPostTags).values(
          validatedData.tags.map((tagId) => ({
            postId: validatedData.id,
            tagId,
          }))
        )
      }
    }

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')
    if (updatedPost) {
      revalidatePath(`/blog/${updatedPost.slug}`)
    }

    return toFormState('SUCCESS', 'Post został zaktualizowany pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Delete a blog post (Admin only)
 */
export async function deleteBlogPostAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check admin access
    await requireAdminAction()

    const id = formData.get('id') as string

    if (!id) {
      return toFormState('ERROR', 'Nieprawidłowe ID posta')
    }

    // Validate input
    const validationResult = DeleteBlogPostSchema.safeParse({ id })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Delete post (cascade will delete tags and likes)
    await db.delete(blogPosts).where(eq(blogPosts.id, validationResult.data.id))

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return toFormState('SUCCESS', 'Post został usunięty pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Publish a blog post (Admin only)
 */
export async function publishBlogPostAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check admin access
    await requireAdminAction()

    const id = formData.get('id') as string
    const publishedAtStr = formData.get('publishedAt') as string | null

    if (!id) {
      return toFormState('ERROR', 'Nieprawidłowe ID posta')
    }

    // Validate input
    const validationResult = PublishBlogPostSchema.safeParse({
      id,
      publishedAt: publishedAtStr ? new Date(publishedAtStr) : undefined,
    })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Update post status to published
    await db
      .update(blogPosts)
      .set({
        status: 'published',
        publishedAt: validationResult.data.publishedAt || new Date(),
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, validationResult.data.id))

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return toFormState('SUCCESS', 'Post został opublikowany pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Archive a blog post (Admin only)
 */
export async function archiveBlogPostAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check admin access
    await requireAdminAction()

    const id = formData.get('id') as string

    if (!id) {
      return toFormState('ERROR', 'Nieprawidłowe ID posta')
    }

    // Update post status to archived
    await db
      .update(blogPosts)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return toFormState('SUCCESS', 'Post został zarchiwizowany pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Increment view count for a blog post
 * Public action (no auth required)
 */
export async function incrementViewCountAction(postId: string): Promise<void> {
  try {
    await db
      .update(blogPosts)
      .set({
        viewCount: sql`${blogPosts.viewCount} + 1`,
      })
      .where(eq(blogPosts.id, postId))
  } catch (error) {
    console.error('Error incrementing view count:', error)
    // Don't throw error, this is a non-critical operation
  }
}

/**
 * Like a blog post (Authenticated users)
 */
export async function likeBlogPostAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check authentication
    const userId = await requireAuth()

    const postId = formData.get('postId') as string

    if (!postId) {
      return toFormState('ERROR', 'Nieprawidłowe ID posta')
    }

    // Validate input
    const validationResult = LikeBlogPostSchema.safeParse({ postId })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Check if already liked
    const existing = await db
      .select()
      .from(blogLikes)
      .where(
        and(
          eq(blogLikes.postId, validationResult.data.postId),
          eq(blogLikes.userId, userId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return toFormState('ERROR', 'Już polubiłeś ten post')
    }

    // Add like
    await db.insert(blogLikes).values({
      postId: validationResult.data.postId,
      userId,
    })

    // Revalidate post page
    revalidatePath('/blog')

    return toFormState('SUCCESS', 'Post został polubiony!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Unlike a blog post (Authenticated users)
 */
export async function unlikeBlogPostAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Check authentication
    const userId = await requireAuth()

    const postId = formData.get('postId') as string

    if (!postId) {
      return toFormState('ERROR', 'Nieprawidłowe ID posta')
    }

    // Validate input
    const validationResult = UnlikeBlogPostSchema.safeParse({ postId })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Remove like
    await db
      .delete(blogLikes)
      .where(
        and(
          eq(blogLikes.postId, validationResult.data.postId),
          eq(blogLikes.userId, userId)
        )
      )

    // Revalidate post page
    revalidatePath('/blog')

    return toFormState('SUCCESS', 'Polubienie zostało usunięte')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

// ============================================================================
// PROGRAMMATIC HELPERS (for direct calls from components, not forms)
// ============================================================================

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Delete a blog post programmatically (Admin only)
 * Used by components that call actions directly (not through forms)
 */
export async function deleteBlogPost(input: { id: string }): Promise<ActionResult> {
  try {
    await requireAdminAction()
    const validationResult = DeleteBlogPostSchema.safeParse(input)

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || 'Nieprawidłowe dane'
      }
    }

    await db.delete(blogPosts).where(eq(blogPosts.id, validationResult.data.id))
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nie udało się usunąć posta'
    }
  }
}

/**
 * Create a blog post programmatically (Admin only)
 */
export async function createBlogPost(input: any): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const admin = await requireAdminAction()
    const validationResult = CreateBlogPostSchema.safeParse(input)

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || 'Nieprawidłowe dane'
      }
    }

    const validatedData = validationResult.data
    const readingTime = calculateReadingTime(validatedData.content)

    const [newPost] = await db
      .insert(blogPosts)
      .values({
        title: validatedData.title,
        slug: validatedData.slug,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        coverImage: validatedData.coverImage || null,
        categoryId: validatedData.categoryId || null,
        authorId: admin.userId,
        authorName: admin.name,
        status: validatedData.status,
        publishedAt: validatedData.status === 'published' ? new Date() : null,
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
        metaKeywords: validatedData.metaKeywords || null,
        readingTime,
        viewCount: 0,
      })
      .returning({ id: blogPosts.id, slug: blogPosts.slug })

    if (validatedData.tags && validatedData.tags.length > 0 && newPost) {
      await db.insert(blogPostTags).values(
        validatedData.tags.map((tagId) => ({
          postId: newPost.id,
          tagId,
        }))
      )
    }

    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return { success: true, data: newPost || { id: '', slug: '' } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nie udało się utworzyć posta'
    }
  }
}

/**
 * Update a blog post programmatically (Admin only)
 */
export async function updateBlogPost(input: any): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdminAction()
    const validationResult = UpdateBlogPostSchema.safeParse(input)

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || 'Nieprawidłowe dane'
      }
    }

    const validatedData = validationResult.data
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.slug) updateData.slug = validatedData.slug
    if (validatedData.excerpt) updateData.excerpt = validatedData.excerpt
    if (validatedData.content) {
      updateData.content = validatedData.content
      updateData.readingTime = calculateReadingTime(validatedData.content)
    }
    if (validatedData.coverImage !== undefined)
      updateData.coverImage = validatedData.coverImage
    if (validatedData.categoryId !== undefined)
      updateData.categoryId = validatedData.categoryId
    if (validatedData.status) {
      updateData.status = validatedData.status
      if (validatedData.status === 'published' && !validatedData.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (validatedData.publishedAt !== undefined)
      updateData.publishedAt = validatedData.publishedAt
    if (validatedData.metaTitle !== undefined)
      updateData.metaTitle = validatedData.metaTitle
    if (validatedData.metaDescription !== undefined)
      updateData.metaDescription = validatedData.metaDescription
    if (validatedData.metaKeywords !== undefined)
      updateData.metaKeywords = validatedData.metaKeywords

    const [updatedPost] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, validatedData.id))
      .returning({ id: blogPosts.id, slug: blogPosts.slug })

    if (validatedData.tags) {
      await db.delete(blogPostTags).where(eq(blogPostTags.postId, validatedData.id))
      if (validatedData.tags.length > 0) {
        await db.insert(blogPostTags).values(
          validatedData.tags.map((tagId) => ({
            postId: validatedData.id,
            tagId,
          }))
        )
      }
    }

    revalidatePath('/blog')
    revalidatePath('/blog/admin')
    if (updatedPost) {
      revalidatePath(`/blog/${updatedPost.slug}`)
    }

    return { success: true, data: updatedPost || { id: validatedData.id, slug: '' } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nie udało się zaktualizować posta'
    }
  }
}
