import { PRICING_ANCHOR } from '@/constants/pricingAnchor'

export function getCanceledReturnHref(course: unknown): string {
  if (course === 'opiekun-medyczny' || course === 'pielegniarstwo') {
    return `/kierunki/${course}#${PRICING_ANCHOR}`
  }

  return '/kierunki'
}
