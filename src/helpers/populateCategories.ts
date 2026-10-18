import 'server-only'

import { cache } from 'react'
import { auth } from '@clerk/nextjs/server'
import { getUserEnrollments } from '@/server/queries'
import { getTestCategoryCounts } from '@/server/testCategoryCounts'
import { hasPracticeEnrollmentAccess } from '@/helpers/hasPracticeEnrollmentAccess'
import { populateTestCategories } from '@/helpers/populateTestCategories'

export const getAccessibleCategories = cache(async () => {
  const { userId } = await auth()
  if (!userId) return []
  const [populated, enrollments] = await Promise.all([
    getPopulatedCategories(), getUserEnrollments(userId),
  ])
  return populated.filter((category) => hasPracticeEnrollmentAccess(category.value, enrollments))
    .map((category) => ({ ...category, hasAccess: true }))
})

export const getPopulatedCategories = cache(async () => {
  return populateTestCategories(await getTestCategoryCounts())
})
