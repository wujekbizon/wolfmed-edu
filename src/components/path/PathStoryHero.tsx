import Link from 'next/link'
import PathFacts from './PathFacts'
import StorySceneTrack from './StorySceneTrack'
import CourseCheckoutButton from './CourseCheckoutButton'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import { ownsCourse } from '@/helpers/ownsCourse'
import type { PathData } from '@/types/careerPathsTypes'
import type { PathStory } from '@/types/pathStoryTypes'

export default function PathStoryHero({
  title,
  story,
  pricing,
  ownedCourses
}: {
  title: string
  story: PathStory
  pricing?: PathData['pricing']
  ownedCourses: string[]
}) {
  const entry = pricing?.basic
  const owned = !!pricing && ownsCourse(pricing.courseSlug, ownedCourses)

  return (
    <div className='w-full p-4 sm:p-6 md:p-8 lg:p-12'>
      <div className='relative w-full rounded-3xl bg-white border-3 border-stone-800/30 shadow-[0_10px_24px_-12px_rgba(60,40,40,0.28)]'>
        <div className='grid grid-cols-1 xl:grid-cols-[2fr_3fr]'>
          <div className='rounded-t-3xl bg-gradient-to-b from-[#fdf7f7] to-[#faecec] xl:rounded-tr-none xl:rounded-bl-3xl'>
            <aside className='flex flex-col gap-8 p-6 sm:p-10 lg:p-12 xl:sticky xl:top-24 xl:h-[90vh] xl:justify-around xl:p-14'>
              <div>
                <span className='inline-flex items-center gap-2 self-start rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600'>
                  <span className='w-1.5 h-1.5 rounded-full bg-rose-400' />
                  Kierunek Edukacyjny
                </span>

                <h1 className='mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight'>
                  {title}
                </h1>

                <p className='mt-5 max-w-md lg:max-w-2xl xl:max-w-md text-zinc-600 text-base sm:text-lg leading-relaxed text-pretty'>
                  {story.intro}
                </p>

                {pricing && entry && !owned && (
                  <div className='mt-8'>
                    <CourseCheckoutButton
                      courseSlug={pricing.courseSlug}
                      priceId={entry.priceId}
                      accessTier={entry.accessTier}
                    />
                  </div>
                )}
              </div>

              <div>
                <PathFacts facts={story.facts} />
                <Link
                  href={`#${PRICING_ANCHOR}`}
                  className='group mt-6 inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors'
                >
                  Zobacz plany i ceny
                  <span className='transition-transform duration-200 group-hover:translate-y-0.5'>
                    ↓
                  </span>
                </Link>
              </div>
            </aside>
          </div>
          <StorySceneTrack scenes={story.scenes} />
        </div>
      </div>
    </div>
  )
}
