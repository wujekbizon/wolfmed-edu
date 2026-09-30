import type { KierunkiWolfekContext, KierunkiWolfekCourseSlug } from '@/types/kierunkiWolfekTypes'

export function getKierunkiWolfekPricingText(
  context: KierunkiWolfekContext, courseSlug?: KierunkiWolfekCourseSlug,
): string {
  const courses = context.catalog.filter((course) => !courseSlug || course.slug === courseSlug)
  return courses.map((course) => {
    const currentAccess = context.visitor.ownedCourses.find((owned) => owned.slug === course.slug)
    if (currentAccess) return `${course.title}: masz już dostęp ${currentAccess.tier}. Zobacz stronę kursu, aby sprawdzić dostępne ulepszenia.`
    const offers = course.offers.filter((offer) => offer.available)
    const labels = offers.map((offer) =>
      `${offer.tier === 'basic' ? 'Basic' : 'Premium'} ${offer.price}${
        offer.model === 'subscription' ? ' / mies.' : ' jednorazowo'
      }`)
    return `${course.title}: ${labels.length ? labels.join(' · ') : 'sprawdź aktualną dostępność na stronie kursu'}`
  }).join('\n')
}
