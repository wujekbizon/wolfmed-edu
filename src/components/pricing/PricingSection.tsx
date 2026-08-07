import { PLAN_COMPARISON } from '@/constants/planComparison'
import PricingCardsGrid from './PricingCardsGrid'
import PlanComparisonTable from './PlanComparisonTable'
import PlanComparisonCards from './PlanComparisonCards'
import CourseSubjectList from './CourseSubjectList'
import SectionHeading from './SectionHeading'
import type { PathData } from '@/types/careerPathsTypes'

// `subjectTitles` arrives as a prop rather than being read here:
// SimplePathLayout is a client component, and importing CATEGORY_METADATA
// through it would ship the whole category catalogue to the browser.
export default function PricingSection({
  pricing,
  ownedCourses,
  subjectTitles,
}: {
  pricing: NonNullable<PathData['pricing']>
  ownedCourses: string[]
  subjectTitles: string[]
}) {
  const groups = PLAN_COMPARISON[pricing.courseSlug] ?? []

  return (
    <section aria-labelledby="pricing-title" className="w-full relative">
      <div className="mx-auto w-full max-w-none lg:max-w-6xl px-0 sm:px-6 py-8 sm:py-12 lg:py-16 flex flex-col gap-12 sm:gap-16">
        <div>
          <SectionHeading
            eyebrow="Cennik"
            title="Plany cenowe"
            subtitle="Jednorazowa płatność. Dostęp na zawsze."
            titleId="pricing-title"
          />
          <PricingCardsGrid pricing={pricing} ownedCourses={ownedCourses} />
        </div>

        {groups.length > 0 && (
          <div>
            <SectionHeading
              eyebrow="Porównanie"
              title="Co zawiera każdy plan"
              subtitle="Pełna lista funkcji dostępnych w planach Standard i Premium."
            />
            <PlanComparisonTable groups={groups} />
            <PlanComparisonCards groups={groups} />
            {subjectTitles.length > 0 && <CourseSubjectList titles={subjectTitles} />}
          </div>
        )}
      </div>
    </section>
  )
}
