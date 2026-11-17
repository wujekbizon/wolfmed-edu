import 'server-only'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/server/db'
import { materials } from '@/server/db/schema'
import { getUserEnrollments } from '@/server/queries'
import { hasAccessToTier } from '@/helpers/accessTiers'
import { ESSAY_COURSES } from '@/constants/essay'
import type { EssayResources } from '@/types/essayTypes'

export async function getEssayResources(userId: string): Promise<EssayResources> {
  const [enrollments, rows] = await Promise.all([
    getUserEnrollments(userId),
    db.select({ id: materials.id, title: materials.title, type: materials.type, url: materials.url,
      indexStatus: materials.indexStatus,
      ready: sql<boolean>`coalesce(length(trim(${materials.extractedText})) > 0, false)`,
      retryable: sql<boolean>`${materials.indexStatus} <> 'pending' or coalesce(${materials.indexedAt}, ${materials.createdAt}) < now() - interval '5 minutes'`,
    })
      .from(materials).where(and(eq(materials.userId, userId), inArray(materials.type, ['application/pdf', 'text/plain'])))
      .orderBy(desc(materials.createdAt)),
  ])
  return {
    userId,
    courses: ESSAY_COURSES.filter((course) => enrollments.some((entry) =>
      entry.courseSlug === course.value && hasAccessToTier(entry.accessTier, 'premium'))).map((course) => course.value),
    materials: rows,
  }
}
