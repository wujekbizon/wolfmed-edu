import { PathLayoutProps } from '@/types/careerPathsTypes'
import GradientOverlay from '@/components/GradientOverlay'
import PathHero from '@/components/path/PathHero'
import PathQuestionsHero from '@/components/path/PathQuestionsHero'
import PathStoryHero from '@/components/path/PathStoryHero'
import SectionDivider from '@/components/path/SectionDivider'
import PathTools from '@/components/path/PathTools'
import PricingSection from '@/components/pricing/PricingSection'
import PathCurriculumSection from '@/components/path/PathCurriculumSection'

export default function RichPathLayout({
  title,
  description,
  curriculum,
  features,
  pricing,
  pricingOfferStatuses,
  subjectTitles,
  eligibleLifetimeUpgradeOfferKey,
  subscriptionPlanChange,
  questions,
  story
}: PathLayoutProps) {
  const hasHero = !!story || !!questions

  return (
    // One background for the whole page, with no overflow-hidden so anything
    // sticky further down can still pin. GradientOverlay clips itself.
    <div className='relative w-full'>
      <GradientOverlay />

      <div className='relative'>
        {story && (
          <PathStoryHero
            title={title}
            story={story}
            pricing={pricing}
            pricingOfferStatuses={pricingOfferStatuses}
            eligibleLifetimeUpgradeOfferKey={eligibleLifetimeUpgradeOfferKey}
          />
        )}

        {!story && questions && (
          <PathQuestionsHero
            title={title}
            questions={questions}
            pricing={pricing}
            pricingOfferStatuses={pricingOfferStatuses}
            eligibleLifetimeUpgradeOfferKey={eligibleLifetimeUpgradeOfferKey}
          />
        )}

        <section className='@container flex flex-col w-full p-4 sm:p-6 md:p-8 lg:p-12 gap-8 sm:gap-12 lg:gap-16'>
          {!hasHero && <PathHero title={title} description={description} />}

          <PathCurriculumSection curriculum={curriculum} />

          {features && features.length > 0 && pricing && <SectionDivider />}

          {features && features.length > 0 && pricing && (
            <PathTools features={features} courseSlug={pricing.courseSlug} />
          )}

          {pricing && (
            <PricingSection
              pricing={pricing}
              pricingOfferStatuses={pricingOfferStatuses}
              subjectTitles={subjectTitles}
              eligibleLifetimeUpgradeOfferKey={eligibleLifetimeUpgradeOfferKey}
              subscriptionPlanChange={subscriptionPlanChange}
            />
          )}
        </section>
      </div>
    </div>
  )
}
