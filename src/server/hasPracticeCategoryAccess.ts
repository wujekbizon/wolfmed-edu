import 'server-only'

import { cache } from 'react'
import { and, eq } from 'drizzle-orm'
import { hasPracticeEnrollmentAccess } from '@/helpers/hasPracticeEnrollmentAccess'
import { getUserEnrollments } from '@/server/queries'
import { db } from '@/server/db/index'
import { userCustomCategories } from '@/server/db/schema'

export const hasPracticeCategoryAccess = cache(async (userId: string, category: string) => {
  const enrollments = await getUserEnrollments(userId)
  if (!hasPracticeEnrollmentAccess(category, enrollments)) return false
  if (category.startsWith('moje-testy__')) {
    const owned = await db.query.userCustomCategories.findFirst({
      columns: { id: true },
      where: and(eq(userCustomCategories.userId, userId),
        eq(userCustomCategories.id, category.slice('moje-testy__'.length))),
    })
    return Boolean(owned)
  }
  return true
})
