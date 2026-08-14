import { notFound } from 'next/navigation'
import SimplePathLayout from '@/app/_components/SimplePathLayout'
import RichPathLayout from '@/app/_components/RichPathLayout'
import { careerPathsData } from '@/constants/careerPathsData'
import { getCourseSubjectTitles } from '@/helpers/getCourseSubjectTitles'
import { getEligibleLifetimeUpgradeOfferKey } from '@/helpers/getEligibleLifetimeUpgradeOfferKey'
import { getPricingOfferStatuses } from '@/helpers/getPricingOfferStatuses'
import { STRIPE_PORTAL_CONFIGURATION_ENV_BY_COURSE } from '@/constants/stripePortalConfigurations'
import { getUserEnrollmentsAction } from '@/actions/course-actions'
import type {
  LifetimeUpgradeOfferKey,
  PricingOfferStatusMap,
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
}: {
  slug: string
  pricingOfferStatuses: PricingOfferStatusMap
  eligibleLifetimeUpgradeOfferKey: LifetimeUpgradeOfferKey | null
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
  const { enrollmentGrants } = await getUserEnrollmentsAction()
  const pricing = careerPathsData[slug]?.pricing
  const eligibleLifetimeUpgradeOfferKey = pricing
    ? getEligibleLifetimeUpgradeOfferKey(enrollmentGrants, pricing.courseSlug)
    : null
  const pricingOfferStatuses = pricing
    ? getPricingOfferStatuses(
        enrollmentGrants,
        pricing.courseSlug,
        Boolean(process.env[
          STRIPE_PORTAL_CONFIGURATION_ENV_BY_COURSE[pricing.courseSlug]
        ])
      )
    : {}

  return (
    <PathPageComponent
      slug={slug}
      pricingOfferStatuses={pricingOfferStatuses}
      eligibleLifetimeUpgradeOfferKey={eligibleLifetimeUpgradeOfferKey}
    />
  )
}
