import { PathLayoutProps } from "@/types/careerPathsTypes";
import GradientOverlay from "@/components/GradientOverlay";
import FadeInSection from "@/components/FadeInSection";
import PathHero from "@/components/path/PathHero";
import PathStoryHero from "@/components/path/PathStoryHero";
import PathFeatures from "@/components/path/PathFeatures";
import PricingSection from "@/components/pricing/PricingSection";
import { CAREER_STORY } from "@/constants/careerStory";

export default function SimplePathLayout({
  features,
  description,
  title,
  pricing,
  ownedCourses,
  subjectTitles
}: PathLayoutProps) {
  const story = pricing ? CAREER_STORY[pricing.courseSlug] : undefined

  return (
    <section className='relative @container flex flex-col w-full bg-white p-4 sm:p-6 md:p-8 lg:p-12 gap-8 sm:gap-12 lg:gap-16 overflow-hidden'>
      <GradientOverlay />

      <FadeInSection className='w-full'>
        {story ? (
          <PathStoryHero title={title} story={story} />
        ) : (
          <PathHero title={title} description={description} />
        )}
      </FadeInSection>

      {features && features.length > 0 && (
        <FadeInSection className='w-full'>
          <PathFeatures features={features} />
        </FadeInSection>
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
  )
}
