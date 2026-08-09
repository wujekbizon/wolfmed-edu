import { PathLayoutProps } from '@/types/careerPathsTypes'
import GradientOverlay from '@/components/GradientOverlay'
import CurriculumMap from '../../components/CurriculumMap'
import PathHero from '@/components/path/PathHero'
import PathQuestionsHero from '@/components/path/PathQuestionsHero'
import PathStoryHero from '@/components/path/PathStoryHero'
import SectionScrollCue from '@/components/path/SectionScrollCue'
import PathTools from '@/components/path/PathTools'
import PricingSection from '@/components/pricing/PricingSection'
import { CURRICULUM_ANCHOR } from '@/constants/curriculumAnchor'

export default function RichPathLayout({
  title,
  description,
  curriculum,
  features,
  pricing,
  ownedCourses,
  subjectTitles,
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
            ownedCourses={ownedCourses ?? []}
          />
        )}

        {!story && questions && (
          <PathQuestionsHero
            title={title}
            questions={questions}
            pricing={pricing}
            ownedCourses={ownedCourses ?? []}
          />
        )}

        <section className='@container flex flex-col w-full p-4 sm:p-6 md:p-8 lg:p-12 gap-8 sm:gap-12 lg:gap-16'>
          {!hasHero && <PathHero title={title} description={description} />}

          <section
            id={CURRICULUM_ANCHOR}
            aria-labelledby='curriculum-title'
            className='relative w-full scroll-mt-24 p-4 sm:p-8'
          >
            <header className='mb-6 sm:mb-10 text-center'>
              <span className='inline-block rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium tracking-wide'>
                Program nauczania
              </span>
              <h2
                id='curriculum-title'
                className='mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900'
              >
                Szczegółowa mapa programu
              </h2>
              <p className='mt-3 text-zinc-600 text-base md:text-lg'>
                Przeglądaj przedmioty według roku. Rozwiń moduły, aby zobaczyć
                liczbę godzin, ECTS i formę zaliczenia.
              </p>
            </header>
            <div className='mx-auto w-full max-w-none lg:max-w-6xl'>
              <CurriculumMap curriculum={curriculum ?? []} />
            </div>
          </section>

          {features && features.length > 0 && pricing && <SectionScrollCue />}

          {features && features.length > 0 && pricing && (
            <PathTools features={features} courseSlug={pricing.courseSlug} />
          )}

          {pricing && (
            <PricingSection
              pricing={pricing}
              ownedCourses={ownedCourses ?? []}
              subjectTitles={subjectTitles}
            />
          )}
        </section>
      </div>
    </div>
  )
}
