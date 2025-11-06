'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db/index'
import { blogCategories, blogTags } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { requireAdminAction } from '@/lib/adminHelpers'
import {
  CreateBlogCategorySchema,
  UpdateBlogCategorySchema,
  DeleteBlogCategorySchema,
  CreateBlogTagSchema,
  UpdateBlogTagSchema,
  DeleteBlogTagSchema,
} from '@/server/schema'

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

/**
 * Create a new blog category (Admin only)
 */
export async function createBlogCategoryAction(
  formState: FormState,
  formData: FormData
) {
  try {
    // Check admin access
    await requireAdminAction()

    // Extract data from formData
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string | null
    const color = formData.get('color') as string
    const icon = formData.get('icon') as string | null
    const order = Number(formData.get('order')) || 0

    // Validate input
    const validationResult = CreateBlogCategorySchema.safeParse({
      name,
      slug,
      description: description || undefined,
      color: color || '#ef4444',
      icon: icon || undefined,
      order,
    })

    if (!validationResult.success) {
      return {
        ...fromErrorToFormState(validationResult.error),
        values: { name, slug, description, color, icon, order },
      }
    }

    const validatedData = validationResult.data

    // Create category
    await db.insert(blogCategories).values({
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      color: validatedData.color || '#ef4444',
      icon: validatedData.icon || null,
      order: validatedData.order || 0,
    })

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return toFormState('SUCCESS', 'Kategoria została utworzona pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Update a blog category (Admin only)
 */
export async function updateBlogCategoryAction(
  formState: FormState,
  formData: FormData
) {
  try {
    // Check admin access
    await requireAdminAction()

    // Extract data from formData
    const id = formData.get('id') as string
    const name = formData.get('name') as string | null
    const slug = formData.get('slug') as string | null
    const description = formData.get('description') as string | null
    const color = formData.get('color') as string | null
    const icon = formData.get('icon') as string | null
    const orderStr = formData.get('order') as string | null
    const order = orderStr ? Number(orderStr) : null

    // Build validation object (only include fields that are present)
    const validationInput: any = { id }
    if (name) validationInput.name = name
    if (slug) validationInput.slug = slug
    if (description !== null) validationInput.description = description || undefined
    if (color) validationInput.color = color
    if (icon !== null) validationInput.icon = icon || undefined
    if (order !== null) validationInput.order = order

    // Validate input
    const validationResult = UpdateBlogCategorySchema.safeParse(validationInput)

    if (!validationResult.success) {
      return {
        ...fromErrorToFormState(validationResult.error),
        values: { id, name, slug, description, color, icon, order },
      }
    }

    const validatedData = validationResult.data

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

    return toFormState('SUCCESS', 'Kategoria została zaktualizowana pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Delete a blog category (Admin only)
 * Note: This will set categoryId to NULL for all posts in this category
 */
export async function deleteBlogCategoryAction(
  formState: FormState,
  formData: FormData
) {
  try {
    // Check admin access
    await requireAdminAction()

    const id = formData.get('id') as string

    if (!id) {
      return toFormState('ERROR', 'Nieprawidłowe ID kategorii')
    }

    // Validate input
    const validationResult = DeleteBlogCategorySchema.safeParse({ id })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Delete category (posts will have categoryId set to NULL due to 'set null' cascade)
    await db.delete(blogCategories).where(eq(blogCategories.id, validationResult.data.id))

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return toFormState('SUCCESS', 'Kategoria została usunięta pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

// ============================================================================
// TAG ACTIONS
// ============================================================================

/**
 * Create a new blog tag (Admin only)
 */
export async function createBlogTagAction(
  formState: FormState,
  formData: FormData
) {
  try {
    // Check admin access
    await requireAdminAction()

    // Extract data from formData
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string

    // Validate input
    const validationResult = CreateBlogTagSchema.safeParse({
      name,
      slug,
    })

    if (!validationResult.success) {
      return {
        ...fromErrorToFormState(validationResult.error),
        values: { name, slug },
      }
    }

    const validatedData = validationResult.data

    // Create tag
    await db.insert(blogTags).values({
      name: validatedData.name,
      slug: validatedData.slug,
    })

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return toFormState('SUCCESS', 'Tag został utworzony pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Update a blog tag (Admin only)
 */
export async function updateBlogTagAction(
  formState: FormState,
  formData: FormData
) {
  try {
    // Check admin access
    await requireAdminAction()

    // Extract data from formData
    const id = formData.get('id') as string
    const name = formData.get('name') as string | null
    const slug = formData.get('slug') as string | null

    // Build validation object (only include fields that are present)
    const validationInput: any = { id }
    if (name) validationInput.name = name
    if (slug) validationInput.slug = slug

    // Validate input
    const validationResult = UpdateBlogTagSchema.safeParse(validationInput)

    if (!validationResult.success) {
      return {
        ...fromErrorToFormState(validationResult.error),
        values: { id, name, slug },
      }
    }

    const validatedData = validationResult.data

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

    return toFormState('SUCCESS', 'Tag został zaktualizowany pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Delete a blog tag (Admin only)
 * Note: This will delete all post-tag relationships
 */
export async function deleteBlogTagAction(
  formState: FormState,
  formData: FormData
) {
  try {
    // Check admin access
    await requireAdminAction()

    const id = formData.get('id') as string

    if (!id) {
      return toFormState('ERROR', 'Nieprawidłowe ID tagu')
    }

    // Validate input
    const validationResult = DeleteBlogTagSchema.safeParse({ id })

    if (!validationResult.success) {
      return fromErrorToFormState(validationResult.error)
    }

    // Delete tag (cascade will delete post-tag relationships)
    await db.delete(blogTags).where(eq(blogTags.id, validationResult.data.id))

    // Revalidate blog pages
    revalidatePath('/blog')
    revalidatePath('/blog/admin')

    return toFormState('SUCCESS', 'Tag został usunięty pomyślnie!')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
