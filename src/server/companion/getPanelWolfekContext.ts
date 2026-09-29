import 'server-only'
import { getUserEnrolledCourses } from '@/server/queries'
import type { PanelWolfekContext, PanelWolfekRoute } from '@/types/panelWolfekTypes'

export async function getPanelWolfekContext(
  userId: string, route: PanelWolfekRoute = 'panel.home',
): Promise<PanelWolfekContext | null> {
  if (route === 'panel.results') return { route }
  const courses = await getUserEnrolledCourses(userId)
  if (!courses.length) return null
  return {
    route: 'panel.home',
    courses: courses.map((course) => ({ slug: course.slug, tier: course.accessTier })),
  }
}
