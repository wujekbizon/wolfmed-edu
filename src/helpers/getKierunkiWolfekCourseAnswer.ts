import { getKierunkiWolfekCourseHref } from '@/helpers/getKierunkiWolfekCourseHref'
import type { KierunkiWolfekAnswer, KierunkiWolfekContext, KierunkiWolfekCourseSlug, KierunkiWolfekTopic } from '@/types/kierunkiWolfekTypes'

export function getKierunkiWolfekCourseAnswer(
  topic: KierunkiWolfekTopic, context: KierunkiWolfekContext,
  courseSlug: KierunkiWolfekCourseSlug, text: string, anchor?: string,
): KierunkiWolfekAnswer {
  const title = context.catalog.find((course) => course.slug === courseSlug)?.title ?? courseSlug
  const alreadyHas = context.visitor.ownedCourses.some((item) => item.slug === courseSlug)
  return alreadyHas
    ? { topic, text: `Masz już dostęp do ${title}. Nie sprzedam Ci drugi raz tego samego — otwórz swój panel i korzystaj z kursu.`, href: '/panel', courseSlug }
    : { topic, text, href: getKierunkiWolfekCourseHref(courseSlug, anchor), courseSlug }
}
