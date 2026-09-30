import type { KierunkiWolfekCourseSlug } from '@/types/kierunkiWolfekTypes'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'

export function getKierunkiWolfekCourseHref(courseSlug: KierunkiWolfekCourseSlug): string {
  return `/kierunki/${courseSlug}#${PRICING_ANCHOR}`
}
