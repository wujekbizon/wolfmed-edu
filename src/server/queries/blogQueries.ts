/**
 * Blog-related database queries
 * Using Drizzle ORM with React cache for request deduplication
 */

import 'server-only'
import { cache } from 'react'
import { db } from '@/server/db'
import {
  blogPosts,
  blogCategories,
  blogTags,
  blogPostTags,
  blogComments,
  blogLikes,
} from '@/server/db/schema'
import { eq, desc, asc, sql, and, or, like, count, inArray } from 'drizzle-orm'
import type {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogComment,
  BlogPostFilters,
  BlogStatistics,
} from '@/types/dataTypes'

/**
 * Get all blog posts with optional filters
 */
export const getAllBlogPosts = cache(
  async (filters?: BlogPostFilters): Promise<BlogPost[]> => {
    try {
      const conditions = []

      // Status filter (default to published for public views)
      if (filters?.status) {
        conditions.push(eq(blogPosts.status, filters.status))
      } else {
        conditions.push(eq(blogPosts.status, 'published'))
      }

      // Category filter
      if (filters?.categoryId) {
        conditions.push(eq(blogPosts.categoryId, filters.categoryId))
      }

      // Author filter
      if (filters?.authorId) {
        conditions.push(eq(blogPosts.authorId, filters.authorId))
      }

      // Search filter
      if (filters?.search) {
        conditions.push(
          or(
            like(blogPosts.title, `%${filters.search}%`),
            like(blogPosts.excerpt, `%${filters.search}%`),
            like(blogPosts.content, `%${filters.search}%`)
          )!
        )
      }

      // Build query
      let query = db
        .select()
        .from(blogPosts)
        .where(and(...conditions))
        .$dynamic()

      // Sorting
      const sortBy = filters?.sortBy || 'publishedAt'
      const sortOrder = filters?.sortOrder || 'desc'

      if (sortOrder === 'desc') {
        query = query.orderBy(desc(blogPosts[sortBy]))
      } else {
        query = query.orderBy(asc(blogPosts[sortBy]))
      }

      // Pagination
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.offset(filters.offset)
      }

      const posts = await query

      return posts as BlogPost[]
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  }
)

/**
 * Get blog post by slug (for public viewing)
 */
export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPost | null> => {
    try {
      const post = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published')))
        .limit(1)

      if (post.length === 0) return null

      // Get category if exists
      let category = null
      if (post[0]?.categoryId) {
        const categoryResult = await db
          .select()
          .from(blogCategories)
          .where(eq(blogCategories.id, post[0].categoryId))
          .limit(1)
        category = categoryResult[0] || null
      }

      // Get tags
      const tagsResult = await db
        .select({
          id: blogTags.id,
          name: blogTags.name,
          slug: blogTags.slug,
          createdAt: blogTags.createdAt,
        })
        .from(blogPostTags)
        .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
        .where(eq(blogPostTags.postId, post[0]!.id))

      // Get comment and like counts
      const [commentCountResult] = await db
        .select({ count: count() })
        .from(blogComments)
        .where(eq(blogComments.postId, post[0]!.id))

      const [likeCountResult] = await db
        .select({ count: count() })
        .from(blogLikes)
        .where(eq(blogLikes.postId, post[0]!.id))

      return {
        ...post[0],
        category,
        tags: tagsResult,
        _count: {
          comments: commentCountResult?.count || 0,
          likes: likeCountResult?.count || 0,
        },
      } as BlogPost
    } catch (error) {
      console.error('Error fetching blog post by slug:', error)
      return null
    }
  }
)

/**
 * Get blog post by ID (for admin editing)
 */
export const getBlogPostById = cache(async (id: string): Promise<BlogPost | null> => {
  try {
    const post = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1)

    if (post.length === 0) return null

    // Get category if exists
    let category = null
    if (post[0]?.categoryId) {
      const categoryResult = await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.id, post[0].categoryId))
        .limit(1)
      category = categoryResult[0] || null
    }

    // Get tags
    const tagsResult = await db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
        createdAt: blogTags.createdAt,
      })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, post[0]!.id))

    return {
      ...post[0],
      category,
      tags: tagsResult,
    } as BlogPost
  } catch (error) {
    console.error('Error fetching blog post by ID:', error)
    return null
  }
})

/**
 * Get featured blog posts (most viewed)
 */
export const getFeaturedBlogPosts = cache(
  async (limit: number = 3): Promise<BlogPost[]> => {
    try {
      const posts = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.status, 'published'))
        .orderBy(desc(blogPosts.viewCount))
        .limit(limit)

      return posts as BlogPost[]
    } catch (error) {
      console.error('Error fetching featured blog posts:', error)
      return []
    }
  }
)

/**
 * Get related blog posts based on category and tags
 */
export const getRelatedBlogPosts = cache(
  async (postId: string, limit: number = 4): Promise<BlogPost[]> => {
    try {
      // Get the current post's category and tags
      const currentPost = await getBlogPostById(postId)
      if (!currentPost) return []

      const conditions = [
        eq(blogPosts.status, 'published'),
        sql`${blogPosts.id} != ${postId}`, // Exclude current post
      ]

      // Prefer posts from same category
      if (currentPost.categoryId) {
        conditions.push(eq(blogPosts.categoryId, currentPost.categoryId))
      }

      const relatedPosts = await db
        .select()
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit)

      return relatedPosts as BlogPost[]
    } catch (error) {
      console.error('Error fetching related blog posts:', error)
      return []
    }
  }
)

/**
 * Get popular blog posts (by view count)
 */
export const getPopularBlogPosts = cache(
  async (limit: number = 5): Promise<BlogPost[]> => {
    try {
      const posts = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.status, 'published'))
        .orderBy(desc(blogPosts.viewCount))
        .limit(limit)

      return posts as BlogPost[]
    } catch (error) {
      console.error('Error fetching popular blog posts:', error)
      return []
    }
  }
)

/**
 * Get all blog categories
 */
export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  try {
    const categories = await db
      .select()
      .from(blogCategories)
      .orderBy(asc(blogCategories.order), asc(blogCategories.name))

    return categories as BlogCategory[]
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }
})

/**
 * Get blog category by slug
 */
export const getBlogCategoryBySlug = cache(
  async (slug: string): Promise<BlogCategory | null> => {
    try {
      const category = await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.slug, slug))
        .limit(1)

      return (category[0] as BlogCategory) || null
    } catch (error) {
      console.error('Error fetching blog category by slug:', error)
      return null
    }
  }
)

/**
 * Get all blog tags
 */
export const getBlogTags = cache(async (): Promise<BlogTag[]> => {
  try {
    const tags = await db
      .select()
      .from(blogTags)
      .orderBy(asc(blogTags.name))

    return tags as BlogTag[]
  } catch (error) {
    console.error('Error fetching blog tags:', error)
    return []
  }
})

/**
 * Get blog tag by slug
 */
export const getBlogTagBySlug = cache(async (slug: string): Promise<BlogTag | null> => {
  try {
    const tag = await db
      .select()
      .from(blogTags)
      .where(eq(blogTags.slug, slug))
      .limit(1)

    return (tag[0] as BlogTag) || null
  } catch (error) {
    console.error('Error fetching blog tag by slug:', error)
    return null
  }
})

/**
 * Get posts by category slug
 */
export const getBlogPostsByCategorySlug = cache(
  async (categorySlug: string, limit?: number): Promise<BlogPost[]> => {
    try {
      const category = await getBlogCategoryBySlug(categorySlug)
      if (!category) return []

      let query = db
        .select()
        .from(blogPosts)
        .where(
          and(eq(blogPosts.categoryId, category.id), eq(blogPosts.status, 'published'))
        )
        .orderBy(desc(blogPosts.publishedAt))
        .$dynamic()

      if (limit) {
        query = query.limit(limit)
      }

      const posts = await query
      return posts as BlogPost[]
    } catch (error) {
      console.error('Error fetching posts by category slug:', error)
      return []
    }
  }
)

/**
 * Get posts by tag slug
 */
export const getBlogPostsByTagSlug = cache(
  async (tagSlug: string, limit?: number): Promise<BlogPost[]> => {
    try {
      const tag = await getBlogTagBySlug(tagSlug)
      if (!tag) return []

      const postIds = await db
        .select({ postId: blogPostTags.postId })
        .from(blogPostTags)
        .where(eq(blogPostTags.tagId, tag.id))

      if (postIds.length === 0) return []

      let query = db
        .select()
        .from(blogPosts)
        .where(
          and(
            inArray(
              blogPosts.id,
              postIds.map((p) => p.postId)
            ),
            eq(blogPosts.status, 'published')
          )
        )
        .orderBy(desc(blogPosts.publishedAt))
        .$dynamic()

      if (limit) {
        query = query.limit(limit)
      }

      const posts = await query
      return posts as BlogPost[]
    } catch (error) {
      console.error('Error fetching posts by tag slug:', error)
      return []
    }
  }
)

/**
 * Get blog comments for a post
 */
export const getBlogComments = cache(async (postId: string): Promise<BlogComment[]> => {
  try {
    const comments = await db
      .select()
      .from(blogComments)
      .where(
        and(eq(blogComments.postId, postId), eq(blogComments.status, 'approved'))
      )
      .orderBy(desc(blogComments.createdAt))

    // Organize into parent-child structure
    const commentsMap = new Map<string, BlogComment>()
    const rootComments: BlogComment[] = []

    // First pass: create all comment objects
    comments.forEach((comment) => {
      commentsMap.set(comment.id, { ...comment, replies: [] } as BlogComment)
    })

    // Second pass: organize into tree
    comments.forEach((comment) => {
      const commentObj = commentsMap.get(comment.id)!
      if (comment.parentId) {
        const parent = commentsMap.get(comment.parentId)
        if (parent) {
          parent.replies!.push(commentObj)
        }
      } else {
        rootComments.push(commentObj)
      }
    })

    return rootComments
  } catch (error) {
    console.error('Error fetching blog comments:', error)
    return []
  }
})

/**
 * Check if user has liked a post
 */
export const hasUserLikedPost = cache(
  async (postId: string, userId: string): Promise<boolean> => {
    try {
      const like = await db
        .select()
        .from(blogLikes)
        .where(and(eq(blogLikes.postId, postId), eq(blogLikes.userId, userId)))
        .limit(1)

      return like.length > 0
    } catch (error) {
      console.error('Error checking if user liked post:', error)
      return false
    }
  }
)

/**
 * Get blog statistics for admin dashboard
 */
export const getBlogStatistics = cache(async (): Promise<BlogStatistics> => {
  try {
    const [totalPostsResult] = await db.select({ count: count() }).from(blogPosts)

    const [publishedPostsResult] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))

    const [draftPostsResult] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'draft'))

    const [archivedPostsResult] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'archived'))

    const [totalViewsResult] = await db
      .select({ total: sql<number>`SUM(${blogPosts.viewCount})` })
      .from(blogPosts)

    const [totalCommentsResult] = await db.select({ count: count() }).from(blogComments)

    const [totalLikesResult] = await db.select({ count: count() }).from(blogLikes)

    const [totalCategoriesResult] = await db
      .select({ count: count() })
      .from(blogCategories)

    const [totalTagsResult] = await db.select({ count: count() }).from(blogTags)

    return {
      totalPosts: totalPostsResult?.count || 0,
      publishedPosts: publishedPostsResult?.count || 0,
      draftPosts: draftPostsResult?.count || 0,
      archivedPosts: archivedPostsResult?.count || 0,
      totalViews: totalViewsResult?.total || 0,
      totalComments: totalCommentsResult?.count || 0,
      totalLikes: totalLikesResult?.count || 0,
      totalCategories: totalCategoriesResult?.count || 0,
      totalTags: totalTagsResult?.count || 0,
    }
  } catch (error) {
    console.error('Error fetching blog statistics:', error)
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      archivedPosts: 0,
      totalViews: 0,
      totalComments: 0,
      totalLikes: 0,
      totalCategories: 0,
      totalTags: 0,
    }
  }
})

/**
 * Search blog posts
 */
export const searchBlogPosts = cache(async (query: string): Promise<BlogPost[]> => {
  try {
    if (!query || query.trim().length < 3) return []

    const searchTerm = `%${query}%`
    const posts = await db
      .select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.status, 'published'),
          or(
            like(blogPosts.title, searchTerm),
            like(blogPosts.excerpt, searchTerm),
            like(blogPosts.content, searchTerm)
          )!
        )
      )
      .orderBy(desc(blogPosts.publishedAt))
      .limit(20)

    return posts as BlogPost[]
  } catch (error) {
    console.error('Error searching blog posts:', error)
    return []
  }
})
