import { notFound } from 'next/navigation'
import SimplePathLayout from '@/app/_components/SimplePathLayout'
import RichPathLayout from '@/app/_components/RichPathLayout'
import { careerPathsData } from '@/constants/careerPathsData'
import { getCourseSubjectTitles } from '@/helpers/getCourseSubjectTitles'
import { getCoursePricingContext } from '@/server/payments/getCoursePricingContext'
import type {
  LifetimeUpgradeOfferKey,
  PricingOfferStatusMap,
  SubscriptionPlanChange,
} from '@/types/paymentTypes'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return Object.keys(careerPathsData).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = careerPathsData[slug]
  if (!data) return { title: 'Program nie znaleziony' }

  return {
    title: `${data.title} | Edukacja Medyczna`,
    description: data.description
  }
}

const layoutComponents = {
  simple: SimplePathLayout,
  rich: RichPathLayout
} as const

function PathPageComponent({
  slug,
  pricingOfferStatuses,
  eligibleLifetimeUpgradeOfferKey,
  subscriptionPlanChange,
}: {
  slug: string
  pricingOfferStatuses: PricingOfferStatusMap
  eligibleLifetimeUpgradeOfferKey: LifetimeUpgradeOfferKey | null
  subscriptionPlanChange: SubscriptionPlanChange | null
}) {
  const data = careerPathsData[slug]

  if (!data) notFound()

  const LayoutComponent = layoutComponents[data.templateType]

  if (!LayoutComponent) notFound()

  return (
    <LayoutComponent
      {...data}
      pricingOfferStatuses={pricingOfferStatuses}
      eligibleLifetimeUpgradeOfferKey={eligibleLifetimeUpgradeOfferKey}
      subscriptionPlanChange={subscriptionPlanChange}
      subjectTitles={getCourseSubjectTitles(data.pricing?.courseSlug ?? slug)}
    />
  )
}

export default async function PathPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pricing = careerPathsData[slug]?.pricing
  const pricingContext = pricing
    ? await getCoursePricingContext(pricing.courseSlug)
    : {
        eligibleLifetimeUpgradeOfferKey: null,
        pricingOfferStatuses: {},
        subscriptionPlanChange: null,
      }

  return (
    <PathPageComponent
      slug={slug}
      pricingOfferStatuses={pricingContext.pricingOfferStatuses}
      eligibleLifetimeUpgradeOfferKey={pricingContext.eligibleLifetimeUpgradeOfferKey}
      subscriptionPlanChange={pricingContext.subscriptionPlanChange}
    />
  )
}
