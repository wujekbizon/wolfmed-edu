/**
 * Server actions for blog category and tag management
 * Admin-only operations
 */

'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import { blogCategories, blogTags } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdminAction } from '@/lib/adminHelpers'
import {
  createBlogCategorySchema,
  updateBlogCategorySchema,
  deleteBlogCategorySchema,
  createBlogTagSchema,
  updateBlogTagSchema,
  deleteBlogTagSchema,
} from '@/lib/validations/blog'
import type {
  CreateBlogCategoryInput,
  UpdateBlogCategoryInput,
  DeleteBlogCategoryInput,
  CreateBlogTagInput,
  UpdateBlogTagInput,
  DeleteBlogTagInput,
} from '@/lib/validations/blog'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

/**
 * Create a new blog category (Admin only)
 */
export async function createBlogCategory(
  input: CreateBlogCategoryInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // Check admin access
    await requireAdminAction()

    // Validate input
    const validatedData = createBlogCategorySchema.parse(input)

    // Create category
    const [newCategory] = await db
      .insert(blogCategories)
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        color: validatedData.color || '#ef4444',
        icon: validatedData.icon || null,
        order: validatedData.order || 0,
      })
      .returning({ id: blogCategories.id, slug: blogCategories.slug })

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return {
      success: true,
      data: newCategory || { id: '', slug: '' },
    }
  } catch (error) {
    console.error('Error creating blog category:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się utworzyć kategorii. Spróbuj ponownie.',
    }
  }
}

/**
 * Update a blog category (Admin only)
 */
export async function updateBlogCategory(
  input: UpdateBlogCategoryInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // Check admin access
    await requireAdminAction()

    // Validate input
    const validatedData = updateBlogCategorySchema.parse(input)

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.slug) updateData.slug = validatedData.slug
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description
    if (validatedData.color) updateData.color = validatedData.color
    if (validatedData.icon !== undefined) updateData.icon = validatedData.icon
    if (validatedData.order !== undefined) updateData.order = validatedData.order

    // Update category
    const [updatedCategory] = await db
      .update(blogCategories)
      .set(updateData)
      .where(eq(blogCategories.id, validatedData.id))
      .returning({ id: blogCategories.id, slug: blogCategories.slug })

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')
    if (updatedCategory) {
      revalidatePath(`/blog/category/${updatedCategory.slug}`)
    }

    return {
      success: true,
      data: updatedCategory || { id: validatedData.id, slug: '' },
    }
  } catch (error) {
    console.error('Error updating blog category:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się zaktualizować kategorii. Spróbuj ponownie.',
    }
  }
}

/**
 * Delete a blog category (Admin only)
 * Note: This will set categoryId to NULL for all posts in this category
 */
export async function deleteBlogCategory(
  input: DeleteBlogCategoryInput
): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAction()

    // Validate input
    const validatedData = deleteBlogCategorySchema.parse(input)

    // Delete category (posts will have categoryId set to NULL due to 'set null' cascade)
    await db.delete(blogCategories).where(eq(blogCategories.id, validatedData.id))

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting blog category:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się usunąć kategorii. Spróbuj ponownie.',
    }
  }
}

// ============================================================================
// TAG ACTIONS
// ============================================================================

/**
 * Create a new blog tag (Admin only)
 */
export async function createBlogTag(
  input: CreateBlogTagInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // Check admin access
    await requireAdminAction()

    // Validate input
    const validatedData = createBlogTagSchema.parse(input)

    // Create tag
    const [newTag] = await db
      .insert(blogTags)
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
      })
      .returning({ id: blogTags.id, slug: blogTags.slug })

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return {
      success: true,
      data: newTag || { id: '', slug: '' },
    }
  } catch (error) {
    console.error('Error creating blog tag:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się utworzyć tagu. Spróbuj ponownie.',
    }
  }
}

/**
 * Update a blog tag (Admin only)
 */
export async function updateBlogTag(
  input: UpdateBlogTagInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // Check admin access
    await requireAdminAction()

    // Validate input
    const validatedData = updateBlogTagSchema.parse(input)

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.slug) updateData.slug = validatedData.slug

    // Update tag
    const [updatedTag] = await db
      .update(blogTags)
      .set(updateData)
      .where(eq(blogTags.id, validatedData.id))
      .returning({ id: blogTags.id, slug: blogTags.slug })

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')
    if (updatedTag) {
      revalidatePath(`/blog/tag/${updatedTag.slug}`)
    }

    return {
      success: true,
      data: updatedTag || { id: validatedData.id, slug: '' },
    }
  } catch (error) {
    console.error('Error updating blog tag:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się zaktualizować tagu. Spróbuj ponownie.',
    }
  }
}

/**
 * Delete a blog tag (Admin only)
 * Note: This will delete all post-tag relationships
 */
export async function deleteBlogTag(input: DeleteBlogTagInput): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAction()

    // Validate input
    const validatedData = deleteBlogTagSchema.parse(input)

    // Delete tag (cascade will delete post-tag relationships)
    await db.delete(blogTags).where(eq(blogTags.id, validatedData.id))

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting blog tag:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się usunąć tagu. Spróbuj ponownie.',
    }
  }
}
