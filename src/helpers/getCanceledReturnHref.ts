import { PRICING_ANCHOR } from '@/constants/pricingAnchor'

export function getCanceledReturnHref(course: unknown): string {
  if (course === 'opiekun-medyczny' || course === 'pielegniarstwo' || course === 'angielski-medyczny') {
    return `/kierunki/${course}#${PRICING_ANCHOR}`
  }

  return '/kierunki'
}
