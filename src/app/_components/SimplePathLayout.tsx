import { PathLayoutProps } from "@/types/careerPathsTypes";
import GradientOverlay from "@/components/GradientOverlay";
import FadeInSection from "@/components/FadeInSection";
import PathHero from "@/components/path/PathHero";
import PathStoryHero from "@/components/path/PathStoryHero";
import PathTools from "@/components/path/PathTools";
import PricingSection from "@/components/pricing/PricingSection";
import PathTimeline from "@/components/path/PathTimeline";
import { CAREER_STORY } from "@/constants/careerStory";
import { CAREER_PATH } from "@/constants/careerPath";

export default function SimplePathLayout({
  features,
  description,
  title,
  pricing,
  ownedCourses,
  subjectTitles
}: PathLayoutProps) {
  const story = pricing ? CAREER_STORY[pricing.courseSlug] : undefined
  const careerPath = pricing ? CAREER_PATH[pricing.courseSlug] : undefined

  return (
    <>
      {/* Outside the section below on purpose: its overflow-hidden would
          become the sticky column's scroll container and break the pinning. */}
      {story && <PathStoryHero title={title} story={story} />}
      {careerPath && <PathTimeline path={careerPath} />}

      <section className='relative @container flex flex-col w-full bg-white p-4 sm:p-6 md:p-8 lg:p-12 gap-8 sm:gap-12 lg:gap-16 overflow-hidden'>
        <GradientOverlay />

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
    </>
  )
}
