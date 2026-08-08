import { PathLayoutProps } from '@/types/careerPathsTypes'
import GradientOverlay from '@/components/GradientOverlay'
import FadeInSection from '@/components/FadeInSection'
import PathHero from '@/components/path/PathHero'
import PathStoryHero from '@/components/path/PathStoryHero'
import PathTools from '@/components/path/PathTools'
import PricingSection from '@/components/pricing/PricingSection'
import PathTimeline from '@/components/path/PathTimeline'
import SectionDivider from '@/components/path/SectionDivider'

export default function SimplePathLayout({
  features,
  description,
  title,
  pricing,
  ownedCourses,
  subjectTitles,
  story,
  careerPath
}: PathLayoutProps) {
  return (
    // One background for the whole page. No overflow-hidden here: it would
    // become the scroll container for the story column and the timeline stage,
    // and neither would pin. GradientOverlay clips itself.
    <div className='relative w-full'>
      <GradientOverlay />

      <div className='relative'>
        {story && (
          <PathStoryHero
            title={title}
            story={story}
            pricing={pricing}
            ownedCourses={ownedCourses ?? []}
          />
        )}
        {story && careerPath && <SectionDivider />}
        {careerPath && <PathTimeline path={careerPath} />}

        <section className='@container flex flex-col w-full p-4 sm:p-6 md:p-8 lg:p-12 gap-8 sm:gap-12 lg:gap-16'>
          {!story && (
            <FadeInSection className='w-full'>
              <PathHero title={title} description={description} />
            </FadeInSection>
          )}

          {features && features.length > 0 && pricing && (
            <PathTools features={features} courseSlug={pricing.courseSlug} />
          )}

          {pricing && (
            <FadeInSection className='w-full'>
              <PricingSection
                pricing={pricing}
                ownedCourses={ownedCourses ?? []}
                subjectTitles={subjectTitles}
              />
            </FadeInSection>
          )}
        </section>
      </div>
    </div>
  )
}
