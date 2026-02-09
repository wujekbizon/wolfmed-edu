import "server-only"
import { db } from "@/server/db/index"
import {
  tests,
  courses,
  courseEnrollments,
  completedTestes,
  payments,
  subscriptions,
  users,
  forumPosts,
  forumComments,
  testimonials,
  testSessions,
  notes,
  userCellsList,
  userLimits,
  materials,
  challengeCompletions,
  procedureBadges,
  blogPosts,
  blogCategories,
  blogTags,
  blogPostTags,
  blogLikes,
  userCustomTests,
  userCustomCategories,
  customersMessages,
} from "./db/schema"
import {
  ExtendedCompletedTest,
  ExtendedProcedures,
  ExtendedTest,
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogPostFilters,
  BlogStatistics,
  Procedure,
} from "@/types/dataTypes"
import { cache } from "react"
import { eq, asc, desc, sql, and, or, like, count, inArray } from "drizzle-orm"
import { Post as ForumPost } from "@/types/forumPostsTypes"
import { Payment, Supporter } from "@/types/stripeTypes"
import { NoteInput } from "./schema"
import { Cell, UserCellsList } from "@/types/cellTypes"
import { parseLexicalContent } from "@/helpers/safeJsonParse"

// Get all tests with their data, ordered by newest first
export const getAllTests = cache(async (): Promise<ExtendedTest[]> => {
  const tests = await db.query.tests.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })
  return tests
})

// Get tests filtered by category
export const getTestsByCategory = cache(async (category: string): Promise<ExtendedTest[]> => {
  const tests = await db.query.tests.findMany({
    where: (model) => sql`${model.meta}->>'category' = ${category}`,
    orderBy: (model, { desc }) => desc(model.id),
  })
  return tests
})

// Get unique categories from tests
export const getCategories = cache(async (): Promise<{ meta: { category: string; course: string } }[]> => {
  const tests = await db.query.tests.findMany({
    columns: {
      meta: true,
    },
  })

  // Extract unique categories
  const seen = new Set<string>()
  const uniqueCategories = tests
    .filter((test) => {
      const category = (test.meta as any).category
      if (seen.has(category)) return false
      seen.add(category)
      return true
    })
    .map((test) => ({ meta: test.meta as { category: string; course: string } }))

  return uniqueCategories
})

// Count tests in a specific category
export const countTestsByCategory = cache(async (category: string): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(tests)
    .where(sql`${tests.meta}->>'category' = ${category}`)

  return result[0]?.count || 0
})

/**
 * Fetch all tests created by specific user
 */
export const getUserCustomTests = cache(async (userId: string) => {
  const tests = await db.query.userCustomTests.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.createdAt),
  })
  return tests
})

/**
 * Fetch single user test with ownership verification
 */
export const getUserCustomTestById = cache(
  async (userId: string, testId: string) => {
    const test = await db.query.userCustomTests.findFirst({
      where: (model, { eq, and }) =>
        and(eq(model.id, testId), eq(model.userId, userId)),
    })
    return test
  }
)

/**
 * Delete user test with ownership verification
 */
export const deleteUserCustomTest = async (userId: string, testId: string) => {
  return await db
    .delete(userCustomTests)
    .where(
      and(eq(userCustomTests.id, testId), eq(userCustomTests.userId, userId))
    )
}

/**
 * Get all custom categories for a user
 */
export const getUserCustomCategories = cache(async (userId: string) => {
  return await db.query.userCustomCategories.findMany({
    where: eq(userCustomCategories.userId, userId),
    orderBy: [desc(userCustomCategories.createdAt)],
  })
})

/**
 * Get single category with ownership verification
 */
export const getUserCustomCategoryById = cache(
  async (userId: string, categoryId: string) => {
    return await db.query.userCustomCategories.findFirst({
      where: and(
        eq(userCustomCategories.id, categoryId),
        eq(userCustomCategories.userId, userId)
      ),
    })
  }
)

/**
 * Delete category with ownership verification
 */
export const deleteUserCustomCategory = async (
  userId: string,
  categoryId: string
) => {
  return await db
    .delete(userCustomCategories)
    .where(
      and(
        eq(userCustomCategories.id, categoryId),
        eq(userCustomCategories.userId, userId)
      )
    )
}

// Get all medical procedures, ordered by newest first
export const getAllProcedures = cache(
  async (): Promise<ExtendedProcedures[]> => {
    const procedures = await db.query.procedures.findMany({
      orderBy: (model, { desc }) => desc(model.id),
    })
    return procedures
  }
)

// Get procedure by ID
export const getProcedureById = cache(
  async (id: string): Promise<ExtendedProcedures | null> => {
    const procedure = await db.query.procedures.findFirst({
      where: (model, { eq }) => eq(model.id, id),
    })
    return procedure || null
  }
)

// Get procedure by slug
export const getProcedureBySlug = cache(
  async (slug: string): Promise<ExtendedProcedures | null> => {
    const { getProcedureIdFromSlug } = await import("@/constants/procedureSlugs")
    const procedureId = getProcedureIdFromSlug(slug)

    if (!procedureId) {
      return null
    }

    return getProcedureById(procedureId)
  }
)

// Get all active courses
export const getAllCourses = cache(async () => {
  const allCourses = await db.query.courses.findMany({
    where: (model, { eq }) => eq(model.isActive, true),
    orderBy: (model, { asc }) => asc(model.createdAt),
  })
  return allCourses
})

// Get course by slug
export const getCourseBySlug = cache(async (slug: string) => {
  const course = await db.query.courses.findFirst({
    where: (model, { eq, and }) => and(eq(model.slug, slug), eq(model.isActive, true)),
  })
  return course || null
})

// Get user's enrolled courses with details
export const getUserEnrolledCourses = cache(async (userId: string) => {
  const enrollments = await db
    .select({
      enrollment: courseEnrollments,
      course: courses,
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courseEnrollments.courseSlug, courses.slug))
    .where(
      and(
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.isActive, true),
        eq(courses.isActive, true)
      )
    )
    .orderBy(asc(courseEnrollments.enrolledAt))

  return enrollments.map((row) => ({
    ...row.course,
    enrolledAt: row.enrollment.enrolledAt,
    accessTier: row.enrollment.accessTier,
    expiresAt: row.enrollment.expiresAt,
  }))
})

// ============================================================================
// BLOG QUERIES
// ============================================================================

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
      } else if (filters?.status !== undefined) {
        // If status is explicitly undefined, show all
        conditions.push(eq(blogPosts.status, "published"))
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
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .$dynamic()

      // Sorting
      const sortBy = filters?.sortBy || "publishedAt"
      const sortOrder = filters?.sortOrder || "desc"

      if (sortOrder === "desc") {
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
      console.error("Error fetching blog posts:", error)
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
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
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

      // Get like count
      const [likeCountResult] = await db
        .select({ count: count() })
        .from(blogLikes)
        .where(eq(blogLikes.postId, post[0]!.id))

      return {
        ...post[0],
        category,
        tags: tagsResult,
        _count: {
          likes: likeCountResult?.count || 0,
        },
      } as BlogPost
    } catch (error) {
      console.error("Error fetching blog post by slug:", error)
      return null
    }
  }
)

/**
 * Get blog post by ID (for admin editing)
 */
export const getBlogPostById = cache(
  async (id: string): Promise<BlogPost | null> => {
    try {
      const post = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
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

      return {
        ...post[0],
        category,
        tags: tagsResult,
      } as BlogPost
    } catch (error) {
      console.error("Error fetching blog post by ID:", error)
      return null
    }
  }
)

/**
 * Get featured blog posts (most viewed)
 */
export const getFeaturedBlogPosts = cache(
  async (limit: number = 3): Promise<BlogPost[]> => {
    try {
      const posts = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.viewCount))
        .limit(limit)

      return posts as BlogPost[]
    } catch (error) {
      console.error("Error fetching featured blog posts:", error)
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
        eq(blogPosts.status, "published"),
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
      console.error("Error fetching related blog posts:", error)
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
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.viewCount))
        .limit(limit)

      return posts as BlogPost[]
    } catch (error) {
      console.error("Error fetching popular blog posts:", error)
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
    console.error("Error fetching blog categories:", error)
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
      console.error("Error fetching blog category by slug:", error)
      return null
    }
  }
)

/**
 * Get blog category by ID
 */
export const getBlogCategoryById = cache(
  async (id: string): Promise<BlogCategory | null> => {
    try {
      const category = await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.id, id))
        .limit(1)

      return (category[0] as BlogCategory) || null
    } catch (error) {
      console.error("Error fetching blog category by id:", error)
      return null
    }
  }
)

/**
 * Get all blog tags
 */
export const getBlogTags = cache(async (): Promise<BlogTag[]> => {
  try {
    const tags = await db.select().from(blogTags).orderBy(asc(blogTags.name))

    return tags as BlogTag[]
  } catch (error) {
    console.error("Error fetching blog tags:", error)
    return []
  }
})

/**
 * Get blog tag by slug
 */
export const getBlogTagBySlug = cache(
  async (slug: string): Promise<BlogTag | null> => {
    try {
      const tag = await db
        .select()
        .from(blogTags)
        .where(eq(blogTags.slug, slug))
        .limit(1)

      return (tag[0] as BlogTag) || null
    } catch (error) {
      console.error("Error fetching blog tag by slug:", error)
      return null
    }
  }
)

/**
 * Get blog tag by ID
 */
export const getBlogTagById = cache(
  async (id: string): Promise<BlogTag | null> => {
    try {
      const tag = await db
        .select()
        .from(blogTags)
        .where(eq(blogTags.id, id))
        .limit(1)

      return (tag[0] as BlogTag) || null
    } catch (error) {
      console.error("Error fetching blog tag by id:", error)
      return null
    }
  }
)

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
          and(
            eq(blogPosts.categoryId, category.id),
            eq(blogPosts.status, "published")
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
      console.error("Error fetching posts by category slug:", error)
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
            eq(blogPosts.status, "published")
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
      console.error("Error fetching posts by tag slug:", error)
      return []
    }
  }
)

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
      console.error("Error checking if user liked post:", error)
      return false
    }
  }
)

/**
 * Get blog statistics for admin dashboard
 */
export const getBlogStatistics = cache(async (): Promise<BlogStatistics> => {
  try {
    const [totalPostsResult] = await db
      .select({ count: count() })
      .from(blogPosts)

    const [publishedPostsResult] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))

    const [draftPostsResult] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "draft"))

    const [archivedPostsResult] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "archived"))

    const [totalViewsResult] = await db
      .select({ total: sql<number>`SUM(${blogPosts.viewCount})` })
      .from(blogPosts)

    const [totalLikesResult] = await db
      .select({ count: count() })
      .from(blogLikes)

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
      totalLikes: totalLikesResult?.count || 0,
      totalCategories: totalCategoriesResult?.count || 0,
      totalTags: totalTagsResult?.count || 0,
    }
  } catch (error) {
    console.error("Error fetching blog statistics:", error)
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      archivedPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalCategories: 0,
      totalTags: 0,
    }
  }
})

/**
 * Search blog posts
 */
export const searchBlogPosts = cache(
  async (query: string): Promise<BlogPost[]> => {
    try {
      if (!query || query.trim().length < 3) return []

      const searchTerm = `%${query}%`
      const posts = await db
        .select()
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.status, "published"),
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
      console.error("Error searching blog posts:", error)
      return []
    }
  }
)

// Get all completed tests for a specific user, ordered by completion date
export const getCompletedTestsByUser = cache(
  async (userId: string): Promise<ExtendedCompletedTest[]> => {
    const completedTest = await db.query.completedTestes.findMany({
      where: (model, { eq }) => eq(model.userId, userId),
      orderBy: (model, { desc }) => desc(model.completedAt),
    })
    return completedTest
  }
)

// Get a specific completed test by its ID
export const getCompletedTest = cache(async (testId: string) => {
  const completedTest = await db.query.completedTestes.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })
  return completedTest
})

// Get a specific question by its test ID
export const getQuestionById = cache(async (testId: string) => {
  const question = await db.query.tests.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })
  return question
})

// Get user's remaining test limit
export const getUserTestLimit = cache(async (id: string) => {
  const [testLimit] = await db
    .select({ testLimit: users.testLimit })
    .from(users)
    .where(eq(users.userId, id))
  return testLimit
})

// Get userId by Stripe customer ID
export const getUserIdByCustomer = cache(
  async (customerId: string): Promise<string | null> => {
    try {
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.customerId, customerId))
        .limit(1)
      if (subscription) {
        return subscription[0]?.userId || null
      } else {
        throw new Error("Subscription not found")
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
      throw error
    }
  }
)

export async function getTestSessionDetails(sessionId: string) {
  const session = await db.query.testSessions.findFirst({
    where: eq(testSessions.id, sessionId),
    columns: {
      durationMinutes: true,
      numberOfQuestions: true,
    },
  })
  return session
}

// Get userId by customer email
export const getUserIdByCustomerEmail = cache(
  async (customerEmail: string): Promise<string | null> => {
    try {
      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.customerEmail, customerEmail))
        .limit(1)
      if (payment) {
        return payment[0]?.userId || null
      } else {
        throw new Error("Payment not found")
      }
    } catch (error) {
      console.error("Error fetching payment:", error)
      throw error
    }
  }
)

// Get a blog post by its ID
export const getPostById = cache(async (id: string) => {
  const post = await db.query.blogPosts.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  })
  return post
})

// Delete a completed test by its ID
export const deleteCompletedTest = cache(async (testId: string) => {
  await db.delete(completedTestes).where(eq(completedTestes.id, testId))
})

// Update username for a specific user
export const updateUsernameByUserId = cache(
  async (userId: string, newUsername: string) => {
    await db
      .update(users)
      .set({ username: newUsername })
      .where(eq(users.userId, userId))
  }
)

// Get username for a specific user
export const getUserUsername = cache(
  async (userId: string): Promise<string> => {
    const user = await db.query.users.findFirst({
      where: (model, { eq }) => eq(model.userId, userId),
      columns: { username: true },
    })
    return user?.username || ""
  }
)

// Update motto for a specific user
export const updateMottoByUserId = cache(
  async (userId: string, newMotto: string) => {
    await db
      .update(users)
      .set({ motto: newMotto })
      .where(eq(users.userId, userId))
  }
)

// Get motto for a specific user
export const getUserMotto = cache(async (userId: string): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
    columns: { motto: true },
  })
  return user?.motto || ""
})

// Get early supporters list, limited to specified number
export const getEarlySupporters = cache(
  async (limit: number = 5): Promise<{ id: string; username: string }[]> => {
    const supporters = await db
      .select({
        userId: users.userId,
        username: users.username,
      })
      .from(users)
      .where(eq(users.supporter, true))
      .orderBy(asc(users.createdAt))
      .limit(limit)

    return supporters.map((supporter) => ({
      id: supporter.userId,
      username: supporter.username || "Anonymous",
    }))
  }
)

// Get user statistics (total score, questions, tests attempted)
export const getUserStats = cache(
  async (
    userId: string
  ): Promise<{
    totalScore: number
    totalQuestions: number
    testsAttempted: number
  }> => {
    const result = await db
      .select({
        totalScore: users.totalScore,
        totalQuestions: users.totalQuestions,
        testsAttempted: users.testsAttempted,
      })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1)

    return {
      totalScore: result[0]?.totalScore || 0,
      totalQuestions: result[0]?.totalQuestions || 0,
      testsAttempted: result[0]?.testsAttempted || 0,
    }
  }
)

// Get all forum posts with their comments, ordered by creation date
export const getAllForumPosts = cache(async (): Promise<ForumPost[]> => {
  const posts = await db.query.forumPosts.findMany({
    orderBy: (model, { desc }) => desc(model.createdAt),
    with: {
      comments: {
        orderBy: (model, { asc }) => asc(model.createdAt),
      },
    },
  })

  return posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    comments: post.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  }))
})

// Get a specific forum post with its comments
export const getForumPostById = cache(
  async (postId: string): Promise<ForumPost | null> => {
    const post = await db.query.forumPosts.findFirst({
      where: (model, { eq }) => eq(model.id, postId),
      with: {
        comments: {
          orderBy: (model, { asc }) => asc(model.createdAt),
        },
      },
    })

    if (!post) return null

    return {
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      comments: post.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
      })),
    }
  }
)

// Create a new forum post
export const createForumPost = cache(
  async (data: {
    title: string
    content: string
    authorId: string
    authorName: string
    readonly: boolean
  }) => {
    const post = await db
      .insert(forumPosts)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return post[0]
  }
)

// Delete a forum post and its associated comments
export const deleteForumPost = cache(async (postId: string) => {
  await db.delete(forumPosts).where(eq(forumPosts.id, postId))
})

// Create a new comment on a forum post
export const createForumComment = cache(
  async (data: {
    postId: string
    content: string
    authorId: string
    authorName: string
  }) => {
    const comment = await db
      .insert(forumComments)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning()

    return comment[0]
  }
)

// Delete a specific comment
export const deleteForumComment = cache(async (commentId: string) => {
  await db.delete(forumComments).where(eq(forumComments.id, commentId))
})

// Get the timestamp of user's last forum post
export const getLastUserPostTime = cache(
  async (userId: string): Promise<Date | null> => {
    const [lastPost] = await db
      .select({ createdAt: forumPosts.createdAt })
      .from(forumPosts)
      .where(eq(forumPosts.authorId, userId))
      .orderBy(desc(forumPosts.createdAt))
      .limit(1)

    return lastPost?.createdAt ?? null
  }
)

// Get the timestamp of user's last comment
export const getLastUserCommentTime = cache(
  async (userId: string): Promise<Date | null> => {
    const [lastComment] = await db
      .select({ createdAt: forumComments.createdAt })
      .from(forumComments)
      .where(eq(forumComments.authorId, userId))
      .orderBy(desc(forumComments.createdAt))
      .limit(1)

    return lastComment?.createdAt ?? null
  }
)

// Get stripe support payments
export const getStripeSupportPayments = cache(async (): Promise<Payment[]> => {
  const payments = await db.query.payments.findMany()
  return payments.map((p) => ({
    ...p,
    createdAt: p.createdAt ?? new Date(),
  }))
})

// Get supporters userId from stripe support payments
export const getSupportersUserIds = cache(async (): Promise<string[]> => {
  const payments = await getStripeSupportPayments()
  const supportersUserId = payments.map((payment) => payment.userId)
  return supportersUserId
})

export const getSupportersWithUsernames = cache(
  async (): Promise<Supporter[]> => {
    const supporters = await db
      .select({
        id: users.id,
        userId: users.userId,
        username: users.username,
      })
      .from(users)
      .where(
        sql`${users.userId} IN (SELECT ${payments.userId} FROM ${payments})`
      )

    return supporters
  }
)

// Create testimonial
export const createTestimonial = async (data: {
  userId: string
  content: string
  rating: number
  visible: boolean
}) => {
  const testimonial = await db
    .insert(testimonials)
    .values({ ...data, createdAt: new Date() })
    .returning()

  return testimonial[0]
}

export const getTestimonials = cache(async (visibleOnly = true) => {
  return db.query.testimonials.findMany({
    where: visibleOnly ? (t, { eq }) => eq(t.visible, true) : undefined,
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
})

export const getTestimonialsWithUsernames = cache(
  async (visibleOnly = true) => {
    const results = await db
      .select({
        id: testimonials.id,
        content: testimonials.content,
        rating: testimonials.rating,
        visible: testimonials.visible,
        createdAt: testimonials.createdAt,
        updatedAt: testimonials.updatedAt,
        userId: testimonials.userId,
        username: users.username,
      })
      .from(testimonials)
      .leftJoin(users, sql`${testimonials.userId} = ${users.userId}`)
      .where(visibleOnly ? sql`${testimonials.visible} = true` : undefined)
      .orderBy(sql`${testimonials.createdAt} DESC`)

    return results
  }
)

export const getUserTestimonials = cache(async (userId: string) => {
  return db.query.testimonials.findMany({
    where: (t, { eq }) => eq(t.userId, userId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
})

export const updateTestimonial = async (
  id: string,
  data: { content?: string; rating?: number; visible?: boolean }
) => {
  const updated = await db
    .update(testimonials)
    .set({ ...data, createdAt: new Date() })
    .where(eq(testimonials.id, id))
    .returning()

  return updated[0]
}

export const deleteTestimonial = cache(async (id: string) => {
  const deleted = await db
    .delete(testimonials)
    .where(eq(testimonials.id, id))
    .returning()

  return deleted[0]
})

export const expireTestSession = async (sessionId: string, userId: string) => {
  const now = new Date()

  await db.transaction(async (tx) => {
    // Lock and verify session ownership and status
    const [session] = await tx
      .select()
      .from(testSessions)
      .where(
        and(
          eq(testSessions.id, sessionId),
          eq(testSessions.userId, userId)
        )
      )
      .for("update")

    if (!session) {
      return;
    }

    if (session.status === "ACTIVE") {
      await tx
        .update(testSessions)
        .set({ status: "EXPIRED", finishedAt: now })
        .where(eq(testSessions.id, sessionId))
    }
  })
}

export const getAllUserNotes = cache(async (userId: string) => {
  const notesList = await db.query.notes.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.createdAt),
  })

  return notesList.map((note) => ({
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }))
})

export const getTopPinnedNotes = cache(async (userId: string, limit = 5) => {
  const notesList = await db.query.notes.findMany({
    where: (model, { and, eq }) =>
      and(eq(model.userId, userId), eq(model.pinned, true)),
    orderBy: (model, { desc }) => desc(model.createdAt),
    limit,
  })

  return notesList.map((note) => ({
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }))
})

export const getNoteById = cache(async (userId: string, noteId: string) => {
  const note = await db.query.notes.findFirst({
    where: (model, { and, eq }) =>
      and(eq(model.id, noteId), eq(model.userId, userId)),
  })

  if (!note) return null

  return {
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }
})

export const createNote = cache(async (userId: string, data: NoteInput) => {
  const contentResult = parseLexicalContent(data.content)

  if (!contentResult.success) {
    throw new Error(`Invalid note content: ${contentResult.error}`)
  }

  const note = await db
    .insert(notes)
    .values({
      ...data,
      content: contentResult.content,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return note[0]
})

export const updateNote = cache(
  async (userId: string, noteId: string, data: Partial<NoteInput>) => {
    let parsedContent = undefined
    if (data.content) {
      const contentResult = parseLexicalContent(data.content)
      if (!contentResult.success) {
        throw new Error(`Invalid note content: ${contentResult.error}`)
      }
      parsedContent = contentResult.content
    }

    const note = await db
      .update(notes)
      .set({
        ...data,
        ...(parsedContent ? { content: parsedContent } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning()

    return note[0] || null
  }
)

export const deleteNote = cache(async (userId: string, noteId: string) => {
  const deleted = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning()
  return deleted[0] || null
})

export const deleteMaterial = cache(
  async (userId: string, materialId: string) => {
    const deleted = await db
      .delete(materials)
      .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
      .returning()
    return deleted[0] || null
  }
)

export const getUserCellsList = cache(
  async (userId: string): Promise<UserCellsList | null> => {
    const rows = await db
      .select()
      .from(userCellsList)
      .where(eq(userCellsList.userId, userId))
      .limit(1)

    const userCells = rows[0] ?? null

    if (!userCells) return null

    return {
      id: userCells.id,
      cells: userCells.cells as Record<string, Cell>,
      order: userCells.order as string[],
    }
  }
)

export const createUserCellsList = cache(
  async (userId: string, cells: Record<string, Cell>, order: string[]) => {
    await db.insert(userCellsList).values({
      userId,
      cells,
      order,
    })
  }
)

export const updateUserCellsList = cache(
  async (userId: string, cells: Record<string, Cell>, order: string[]) => {
    await db
      .update(userCellsList)
      .set({
        cells,
        order,
        updatedAt: new Date(),
      })
      .where(eq(userCellsList.userId, userId))
  }
)

export const checkUserCellsList = cache(async (userId: string) => {
  const existing = await db
    .select()
    .from(userCellsList)
    .where(eq(userCellsList.userId, userId))
    .limit(1)

  return existing[0] || null
})

export const getMaterialsByUser = cache(async (userId: string) => {
  const rows = await db.query.materials.findMany({
    where: (m, { eq }) => eq(m.userId, userId),
    orderBy: (m, { desc }) => desc(m.createdAt),
  })

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt?.toISOString?.() ?? null,
    updatedAt: r.updatedAt?.toISOString?.() ?? null,
  }))
})

export const getMaterialById = cache(async (userId: string, materialId: string) => {
  const material = await db.query.materials.findFirst({
    where: (m, { eq, and }) => and(eq(m.id, materialId), eq(m.userId, userId)),
  })

  if (!material) return null

  return {
    ...material,
    createdAt: material.createdAt?.toISOString?.() ?? null,
    updatedAt: material.updatedAt?.toISOString?.() ?? null,
  }
})

export const getUserStorageUsage = async (userId: string) => {
  const userStorage = await db
    .select()
    .from(userLimits)
    .where(eq(userLimits.userId, userId))
    .limit(1)

  if (userStorage.length === 0) {
    return {
      storageUsed: 0,
      storageLimit: 20_000_000,
    }
  }

  return {
    storageUsed: userStorage[0]?.storageUsed ?? 0,
    storageLimit: userStorage[0]?.storageLimit ?? 20_000_000,
  }
}

// ============================================================================
// Challenge Completions & Badges Queries
// ============================================================================

/**
 * Get all challenge completions for a specific procedure
 */
export const getChallengeCompletionsByProcedure = cache(
  async (userId: string, procedureId: string) => {
    const completions = await db.query.challengeCompletions.findMany({
      where: (model, { and, eq }) =>
        and(
          eq(model.userId, userId),
          eq(model.procedureId, procedureId),
          eq(model.passed, true)
        ),
      orderBy: (model, { desc }) => desc(model.completedAt),
    })

    return completions
  }
)

/**
 * Get a specific challenge completion
 */
export const getChallengeCompletion = cache(
  async (userId: string, procedureId: string, challengeType: string) => {
    const completion = await db.query.challengeCompletions.findFirst({
      where: (model, { and, eq }) =>
        and(
          eq(model.userId, userId),
          eq(model.procedureId, procedureId),
          eq(model.challengeType, challengeType)
        ),
    })

    return completion
  }
)

/**
 * Save or update a challenge completion
 * Used within a transaction
 */
export const saveChallengeCompletion = async (
  tx: any,
  data: {
    userId: string
    procedureId: string
    challengeType: string
    score: number
    timeSpent: number
  }
) => {
  // Calculate if challenge was passed (score >= 70%)
  const passed = data.score >= 70

  // Check if completion already exists
  const existing = await tx
    .select()
    .from(challengeCompletions)
    .where(
      and(
        eq(challengeCompletions.userId, data.userId),
        eq(challengeCompletions.procedureId, data.procedureId),
        eq(challengeCompletions.challengeType, data.challengeType)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    // Update existing completion
    await tx
      .update(challengeCompletions)
      .set({
        score: data.score,
        timeSpent: data.timeSpent,
        passed,
        attempts: sql`${challengeCompletions.attempts} + 1`,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(challengeCompletions.userId, data.userId),
          eq(challengeCompletions.procedureId, data.procedureId),
          eq(challengeCompletions.challengeType, data.challengeType)
        )
      )
  } else {
    // Insert new completion
    await tx.insert(challengeCompletions).values({
      ...data,
      passed,
      attempts: 1,
      completedAt: new Date(),
    })
  }
}

/**
 * Check if all 5 challenges are completed (passed) for a procedure
 * Used within a transaction
 */
export const checkAllChallengesComplete = async (
  tx: any,
  userId: string,
  procedureId: string
): Promise<boolean> => {
  const completions = await tx
    .select()
    .from(challengeCompletions)
    .where(
      and(
        eq(challengeCompletions.userId, userId),
        eq(challengeCompletions.procedureId, procedureId),
        eq(challengeCompletions.passed, true)
      )
    )

  // Need 5 unique challenge types PASSED (score >= 70%)
  const uniqueChallengeTypes = new Set(
    completions.map((c: any) => c.challengeType)
  )
  return uniqueChallengeTypes.size >= 5
}

/**
 * Award a badge to a user
 * Used within a transaction
 */
export const awardBadge = async (
  tx: any,
  data: {
    userId: string
    procedureId: string
    procedureName: string
    badgeImageUrl?: string
  }
) => {
  // Check if badge already exists
  const existing = await tx
    .select()
    .from(procedureBadges)
    .where(
      and(
        eq(procedureBadges.userId, data.userId),
        eq(procedureBadges.procedureId, data.procedureId)
      )
    )
    .limit(1)

  if (existing.length === 0) {
    const procedure = await getProcedureById(data.procedureId) as Procedure

    await tx.insert(procedureBadges).values({
      userId: data.userId,
      procedureId: data.procedureId,
      procedureName: data.procedureName,
      badgeImageUrl:
        procedure?.data.image ||
        "https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5R8iqyMoJ4bO3G5lMSTzfQXhE0VIeNdPaZLnk",
      earnedAt: new Date(),
    })
  }
}

/**
 * Get a specific badge for a procedure
 */
export const getProcedureBadge = cache(
  async (userId: string, procedureId: string) => {
    const badge = await db.query.procedureBadges.findFirst({
      where: (model, { and, eq }) =>
        and(eq(model.userId, userId), eq(model.procedureId, procedureId)),
    })

    return badge
  }
)

/**
 * Get all badges earned by a user
 */
export const getUserBadges = cache(async (userId: string) => {
  const badges = await db.query.procedureBadges.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.earnedAt),
  })

  return badges.map((badge) => ({
    ...badge,
    earnedAt: badge.earnedAt.toISOString(),
  }))
})

/**
 * Get all customer messages with pagination
 */
export const getAllMessages = cache(
  async (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit

    const messages = await db.query.customersMessages.findMany({
      orderBy: (model, { desc }) => desc(model.createdAt),
      limit,
      offset,
    })

    const [totalResult] = await db
      .select({ count: count() })
      .from(customersMessages)
    const total = totalResult?.count || 0

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
)

/**
 * Get message statistics
 * Optimized: 1 query instead of 4 separate queries
 */
export const getMessageStats = cache(async () => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  // Single query with conditional aggregations
  const [stats] = await db
    .select({
      total: count(),
      unread: sql<number>`COUNT(*) FILTER (WHERE ${customersMessages.isRead} = false)`,
      thisWeek: sql<number>`COUNT(*) FILTER (WHERE ${customersMessages.createdAt} >= ${oneWeekAgo})`,
      thisMonth: sql<number>`COUNT(*) FILTER (WHERE ${customersMessages.createdAt} >= ${oneMonthAgo})`,
    })
    .from(customersMessages)

  return {
    total: stats?.total || 0,
    unread: Number(stats?.unread) || 0,
    thisWeek: Number(stats?.thisWeek) || 0,
    thisMonth: Number(stats?.thisMonth) || 0,
  }
})

/**
 * Mark a message as read
 */
export const markMessageAsRead = async (id: number) => {
  await db
    .update(customersMessages)
    .set({ isRead: true, updatedAt: new Date() })
    .where(eq(customersMessages.id, id))
}

/**
 * Get unread message count
 */
export const getUnreadMessageCount = cache(async () => {
  const [result] = await db
    .select({ count: count() })
    .from(customersMessages)
    .where(eq(customersMessages.isRead, false))

  return result?.count || 0
})

export const getDetailedTestHistory = cache(
  async (userId: string, limit: number = 50) => {
    const tests = await db
      .select({
        id: completedTestes.id,
        score: completedTestes.score,
        testResult: completedTestes.testResult,
        completedAt: completedTestes.completedAt,
        category: testSessions.category,
        numberOfQuestions: testSessions.numberOfQuestions,
        durationMinutes: testSessions.durationMinutes,
      })
      .from(completedTestes)
      .innerJoin(testSessions, eq(completedTestes.sessionId, testSessions.id))
      .where(eq(completedTestes.userId, userId))
      .orderBy(desc(completedTestes.completedAt))
      .limit(limit)

    return tests.map((test) => ({
      ...test,
      completedAt: test.completedAt.toISOString(),
    }))
  }
)

export const getQuestionAccuracyAnalytics = cache(async (userId: string) => {
  const tests = await db
    .select({
      testResult: completedTestes.testResult,
    })
    .from(completedTestes)
    .where(eq(completedTestes.userId, userId))

  const questionStats = new Map<
    string,
    { timesAnswered: number; timesCorrect: number }
  >()

  tests.forEach((test) => {
    const results = test.testResult as Array<{
      questionId: string
      answer: boolean
    }>
    if (Array.isArray(results)) {
      results.forEach((result) => {
        const stats = questionStats.get(result.questionId) || {
          timesAnswered: 0,
          timesCorrect: 0,
        }
        stats.timesAnswered++
        if (result.answer) stats.timesCorrect++
        questionStats.set(result.questionId, stats)
      })
    }
  })

  const problemQuestions = Array.from(questionStats.entries())
    .map(([questionId, stats]) => ({
      questionId,
      timesAnswered: stats.timesAnswered,
      timesCorrect: stats.timesCorrect,
      accuracy: (stats.timesCorrect / stats.timesAnswered) * 100,
    }))
    .filter((q) => q.accuracy < 50)
    .sort((a, b) => a.accuracy - b.accuracy)

  return problemQuestions
})

export const getCategoryPerformance = cache(async (userId: string) => {
  const tests = await db
    .select({
      score: completedTestes.score,
      category: testSessions.category,
      numberOfQuestions: testSessions.numberOfQuestions,
    })
    .from(completedTestes)
    .innerJoin(testSessions, eq(completedTestes.sessionId, testSessions.id))
    .where(eq(completedTestes.userId, userId))

  const categoryStats = new Map<
    string,
    { totalTests: number; totalScore: number; totalQuestions: number }
  >()

  tests.forEach((test) => {
    const stats = categoryStats.get(test.category) || {
      totalTests: 0,
      totalScore: 0,
      totalQuestions: 0,
    }
    stats.totalTests++
    stats.totalScore += test.score
    stats.totalQuestions += test.numberOfQuestions
    categoryStats.set(test.category, stats)
  })

  return Array.from(categoryStats.entries()).map(([category, stats]) => ({
    category,
    totalTests: stats.totalTests,
    avgScore: ((stats.totalScore / stats.totalQuestions) * 100).toFixed(2),
    totalQuestions: stats.totalQuestions,
    correctAnswers: stats.totalScore,
  }))
})

export const getProgressTimeline = cache(
  async (userId: string, days: number = 30) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const tests = await db
      .select({
        score: completedTestes.score,
        completedAt: completedTestes.completedAt,
        numberOfQuestions: testSessions.numberOfQuestions,
      })
      .from(completedTestes)
      .innerJoin(testSessions, eq(completedTestes.sessionId, testSessions.id))
      .where(
        and(
          eq(completedTestes.userId, userId),
          sql`${completedTestes.completedAt} >= ${startDate}`
        )
      )
      .orderBy(asc(completedTestes.completedAt))

    const dateMap = new Map<
      string,
      { totalScore: number; totalQuestions: number; count: number }
    >()

    tests.forEach((test) => {
      const date = test.completedAt.toISOString().split("T")[0] || ""
      if (!date) return

      const stats = dateMap.get(date) || {
        totalScore: 0,
        totalQuestions: 0,
        count: 0,
      }
      stats.totalScore += test.score
      stats.totalQuestions += test.numberOfQuestions
      stats.count++
      dateMap.set(date, stats)
    })

    return Array.from(dateMap.entries()).map(([date, stats]) => ({
      date,
      avgScore: ((stats.totalScore / stats.totalQuestions) * 100).toFixed(2),
      testsCount: stats.count,
    }))
  }
)
