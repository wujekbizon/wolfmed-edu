import Link from 'next/link'
import PathBadge from './PathBadge'
import PathQuestionList from './PathQuestionList'
import PathShotCollage from './PathShotCollage'
import CourseCheckoutButton from './CourseCheckoutButton'
import { CURRICULUM_ANCHOR } from '@/constants/curriculumAnchor'
import { ownsCourse } from '@/helpers/ownsCourse'
import type { PathData } from '@/types/careerPathsTypes'
import type { PathQuestions } from '@/types/pathStoryTypes'

export default function PathQuestionsHero({
  title,
  questions,
  pricing,
  ownedCourses
}: {
  title: string
  questions: PathQuestions
  pricing?: PathData['pricing']
  ownedCourses: string[]
}) {
  const entry = pricing?.basic
  const owned = !!pricing && ownsCourse(pricing.courseSlug, ownedCourses)

  return (
    <section
      aria-labelledby='questions-title'
      className='w-full p-4 sm:p-6 md:p-8 lg:p-12'
    >
      <div className='relative w-full rounded-3xl bg-white border-3 border-stone-800/30 shadow-[0_10px_24px_-12px_rgba(60,40,40,0.28)]'>
        <div className='grid grid-cols-1 xl:grid-cols-2'>
          <div className='rounded-t-3xl bg-gradient-to-b from-[#fdf7f7] to-[#faecec] xl:rounded-tr-none xl:rounded-bl-3xl'>
            <div className='flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:sticky xl:top-24 xl:h-[90vh] xl:py-14 xl:pl-14 xl:pr-6'>
              <PathBadge label={questions.eyebrow} />

              <h1
                id='questions-title'
                className='mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight'
              >
                {title}
              </h1>

              <p className='mt-5 max-w-md lg:max-w-2xl xl:max-w-xl text-zinc-600 text-base sm:text-lg leading-relaxed text-pretty'>
                {questions.lead}
              </p>

              <PathQuestionList items={questions.items} />

              {pricing && entry && !owned && (
                <div className='mt-8'>
                  <CourseCheckoutButton
                    courseSlug={pricing.courseSlug}
                    priceId={entry.priceId}
                    accessTier={entry.accessTier}
                  />
                </div>
              )}

              <Link
                href={`#${CURRICULUM_ANCHOR}`}
                className='group mt-6 inline-flex items-center gap-2 self-start text-sm font-medium text-rose-600 transition-colors hover:text-rose-700'
              >
                {questions.cta}
                <span
                  aria-hidden='true'
                  className='transition-transform duration-200 group-hover:translate-x-0.5'
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          <PathShotCollage shots={questions.shots} />
        </div>
      </div>
    </section>
  )
}
