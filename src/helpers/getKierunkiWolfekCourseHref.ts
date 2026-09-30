import type { KierunkiWolfekCourseSlug } from '@/types/kierunkiWolfekTypes'
export function getKierunkiWolfekCourseHref(courseSlug: KierunkiWolfekCourseSlug, anchor?: string): string {
  return `/kierunki/${courseSlug}${anchor ? `#${anchor}` : ''}`
}
