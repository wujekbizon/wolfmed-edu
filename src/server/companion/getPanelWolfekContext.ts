import 'server-only'
import { getUserEnrolledCourses } from '@/server/queries'
import type { PanelWolfekContext } from '@/types/panelWolfekTypes'

export async function getPanelWolfekContext(userId: string): Promise<PanelWolfekContext | null> {
  const courses = await getUserEnrolledCourses(userId)
  if (!courses.length) return null
  return {
    route: 'panel.home',
    courses: courses.map((course) => ({ slug: course.slug, tier: course.accessTier })),
  }
}
