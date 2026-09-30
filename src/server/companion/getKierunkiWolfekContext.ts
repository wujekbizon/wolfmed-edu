import 'server-only'
import { careerPathsData } from '@/constants/careerPathsData'
import { MONTHLY_OFFER_BY_COURSE_TIER } from '@/constants/monthlyOfferByCourseTier'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { formatPlnAmount } from '@/helpers/formatPlnAmount'
import { getUserEnrolledCourses } from '@/server/queries'
import type { KierunkiWolfekContext, KierunkiWolfekCourseSlug, KierunkiWolfekOffer } from '@/types/kierunkiWolfekTypes'

export async function getKierunkiWolfekContext(userId: string | null): Promise<KierunkiWolfekContext> {
  const enrolled = userId ? await getUserEnrolledCourses(userId) : []
  const catalog = (Object.keys(careerPathsData) as KierunkiWolfekCourseSlug[]).flatMap((slug) => {
    const course = careerPathsData[slug]
    if (!course) return []
    const pricing = course.pricing
    const offers: KierunkiWolfekOffer[] = []
    for (const tier of ['basic', 'premium'] as const) {
      const tierData = pricing?.[tier]
      if (!tierData) continue
      const keys = [tierData.offerKey, MONTHLY_OFFER_BY_COURSE_TIER[slug][tier]]
      for (const key of keys) {
        const offer = PAYMENT_OFFERS[key]
        offers.push({ tier, model: offer.purchaseModel, price: formatPlnAmount(offer.amount),
          available: offer.available && Boolean(process.env[offer.priceEnvName]) })
      }
    }
    return [{ slug, title: course.title, offers }]
  })

  return {
    route: 'kierunki',
    visitor: {
      signedIn: Boolean(userId),
      ownedCourses: enrolled.map((course) => ({ slug: course.slug as KierunkiWolfekCourseSlug, tier: course.accessTier })),
    },
    catalog,
  }
}
