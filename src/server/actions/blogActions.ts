/**
 * Server actions for blog post management
 * Admin-only operations for creating, updating, and deleting blog posts
 */

'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import { blogPosts, blogPostTags, blogLikes } from '@/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { requireAdminAction, requireAuth } from '@/lib/adminHelpers'
import { calculateReadingTime } from '@/lib/blogUtils'
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  deleteBlogPostSchema,
  publishBlogPostSchema,
  likeBlogPostSchema,
  unlikeBlogPostSchema,
} from '@/lib/validations/blog'
import type {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  DeleteBlogPostInput,
  PublishBlogPostInput,
  LikeBlogPostInput,
  UnlikeBlogPostInput,
} from '@/lib/validations/blog'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new blog post (Admin only)
 */
export async function createBlogPost(
  input: CreateBlogPostInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // Check admin access
    const admin = await requireAdminAction()

    // Validate input
    const validatedData = createBlogPostSchema.parse(input)

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

    return {
      success: true,
      data: newPost || { id: '', slug: '' },
    }
  } catch (error) {
    console.error('Error creating blog post:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się utworzyć posta. Spróbuj ponownie.',
    }
  }
}

/**
 * Update an existing blog post (Admin only)
 */
export async function updateBlogPost(
  input: UpdateBlogPostInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // Check admin access
    await requireAdminAction()

    // Validate input
    const validatedData = updateBlogPostSchema.parse(input)

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

    return {
      success: true,
      data: updatedPost || { id: validatedData.id, slug: '' },
    }
  } catch (error) {
    console.error('Error updating blog post:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się zaktualizować posta. Spróbuj ponownie.',
    }
  }
}

/**
 * Delete a blog post (Admin only)
 */
export async function deleteBlogPost(
  input: DeleteBlogPostInput
): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAction()

    // Validate input
    const validatedData = deleteBlogPostSchema.parse(input)

    // Delete post (cascade will delete tags and likes)
    await db.delete(blogPosts).where(eq(blogPosts.id, validatedData.id))

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się usunąć posta. Spróbuj ponownie.',
    }
  }
}

/**
 * Publish a blog post (Admin only)
 */
export async function publishBlogPost(
  input: PublishBlogPostInput
): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAction()

    // Validate input
    const validatedData = publishBlogPostSchema.parse(input)

    // Update post status to published
    await db
      .update(blogPosts)
      .set({
        status: 'published',
        publishedAt: validatedData.publishedAt || new Date(),
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, validatedData.id))

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error publishing blog post:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się opublikować posta. Spróbuj ponownie.',
    }
  }
}

/**
 * Archive a blog post (Admin only)
 */
export async function archiveBlogPost(id: string): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAction()

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

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error archiving blog post:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się zarchiwizować posta. Spróbuj ponownie.',
    }
  }
}

/**
 * Increment view count for a blog post
 * Public action (no auth required)
 */
export async function incrementViewCount(postId: string): Promise<void> {
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
export async function likeBlogPost(input: LikeBlogPostInput): Promise<ActionResult> {
  try {
    // Check authentication
    const userId = await requireAuth()

    // Validate input
    const validatedData = likeBlogPostSchema.parse(input)

    // Check if already liked
    const existing = await db
      .select()
      .from(blogLikes)
      .where(
        and(
          eq(blogLikes.postId, validatedData.postId),
          eq(blogLikes.userId, userId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return {
        success: false,
        error: 'Już polubiłeś ten post',
      }
    }

    // Add like
    await db.insert(blogLikes).values({
      postId: validatedData.postId,
      userId,
    })

    // Revalidate post page
    revalidatePath('/blog')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error liking blog post:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się polubić posta. Spróbuj ponownie.',
    }
  }
}

/**
 * Unlike a blog post (Authenticated users)
 */
export async function unlikeBlogPost(
  input: UnlikeBlogPostInput
): Promise<ActionResult> {
  try {
    // Check authentication
    const userId = await requireAuth()

    // Validate input
    const validatedData = unlikeBlogPostSchema.parse(input)

    // Remove like
    await db
      .delete(blogLikes)
      .where(
        and(
          eq(blogLikes.postId, validatedData.postId),
          eq(blogLikes.userId, userId)
        )
      )

    // Revalidate post page
    revalidatePath('/blog')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error unliking blog post:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się usunąć polubienia. Spróbuj ponownie.',
    }
  }
}
