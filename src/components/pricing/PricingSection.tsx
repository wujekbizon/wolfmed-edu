import { PLAN_COMPARISON } from '@/constants/planComparison'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import PricingCardsGrid from './PricingCardsGrid'
import PlanComparisonTable from './PlanComparisonTable'
import PlanComparisonCards from './PlanComparisonCards'
import PlanComparisonPanel from './PlanComparisonPanel'
import PlanComparisonToggle from './PlanComparisonToggle'
import CourseSubjectList from './CourseSubjectList'
import SectionHeading from './SectionHeading'
import type { PathData } from '@/types/careerPathsTypes'
import type { LifetimeUpgradeOfferKey } from '@/types/paymentTypes'
import type {
  PricingOfferStatusMap,
  SubscriptionPlanChange,
} from '@/types/paymentTypes'

// `subjectTitles` arrives as a prop rather than being read here:
// SimplePathLayout is a client component, and importing CATEGORY_METADATA
// through it would ship the whole category catalogue to the browser.
export default function PricingSection({
  pricing,
  pricingOfferStatuses,
  subjectTitles,
  eligibleLifetimeUpgradeOfferKey,
  subscriptionPlanChange,
}: {
  pricing: NonNullable<PathData['pricing']>
  pricingOfferStatuses: PricingOfferStatusMap
  subjectTitles: string[]
  eligibleLifetimeUpgradeOfferKey: LifetimeUpgradeOfferKey | null
  subscriptionPlanChange: SubscriptionPlanChange | null
}) {
  const groups = PLAN_COMPARISON[pricing.courseSlug] ?? []

  return (
    <section
      id={PRICING_ANCHOR}
      aria-labelledby='pricing-title'
      className='relative w-full scroll-mt-24 px-5 py-12 sm:px-10 sm:py-16 lg:px-[60px] lg:py-[68px]'
    >
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-12 sm:gap-16'>
        <div>
          <SectionHeading
            eyebrow='Cennik'
            title='Plany cenowe'
            subtitle='Wybierz subskrypcję miesięczną lub dostęp na zawsze.'
            titleId='pricing-title'
          />
          <PricingCardsGrid
            pricing={pricing}
            offerStatuses={pricingOfferStatuses}
            eligibleLifetimeUpgradeOfferKey={eligibleLifetimeUpgradeOfferKey}
            subscriptionPlanChange={subscriptionPlanChange}
          />
          {groups.length > 0 && <PlanComparisonToggle />}
        </div>

        {groups.length > 0 && (
          <PlanComparisonPanel>
            <SectionHeading
              eyebrow='Porównanie'
              title='Co zawiera każdy plan'
              subtitle='Pełna lista funkcji dostępnych w planach Standard i Premium.'
            />
            <PlanComparisonTable groups={groups} />
            <PlanComparisonCards groups={groups} />
            {subjectTitles.length > 0 && (
              <CourseSubjectList titles={subjectTitles} />
            )}
          </PlanComparisonPanel>
        )}
      </div>
    </section>
  )
}
