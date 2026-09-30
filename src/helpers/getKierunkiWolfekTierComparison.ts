import { careerPathsData } from '@/constants/careerPathsData'
import type { KierunkiWolfekContext } from '@/types/kierunkiWolfekTypes'

export function getKierunkiWolfekTierComparison(context: KierunkiWolfekContext): string {
  return context.catalog.map((course) => {
    const path = careerPathsData[course.slug]
    const tiers = course.offers.filter((offer) => offer.available).map((offer) => offer.tier)
    const basic = tiers.includes('basic') ? path?.pricing?.basic.features.slice(0, 4).join('; ') : null
    const premiumFeatures = path?.pricing?.premium?.features
      .filter((feature) => !feature.toLocaleLowerCase('pl-PL').startsWith('wszystko z planu'))
    const premium = tiers.includes('premium') ? premiumFeatures?.slice(0, 4).join('; ') : null
    const comparison = [basic && `Basic: ${basic}`, premium && `Premium: ${premium}`].filter(Boolean)
    return comparison.length ? `${course.title} — ${comparison.join(' · ')}` : null
  }).filter((line): line is string => Boolean(line)).join('\n')
}
