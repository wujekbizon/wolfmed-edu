import Link from 'next/link'
import PathQuestionList from './PathQuestionList'
import PathShotCollage from './PathShotCollage'
import CourseCheckoutButton from './CourseCheckoutButton'
import { CURRICULUM_ANCHOR } from '@/constants/curriculumAnchor'
import { ownsCourse } from '@/helpers/ownsCourse'
import type { PathData } from '@/types/careerPathsTypes'
import type { PathQuestions } from '@/types/pathStoryTypes'

export default function PathQuestionsHero({
  questions,
  pricing,
  ownedCourses
}: {
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
              <p className='font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-rose-500'>
                {questions.eyebrow}
              </p>

              <h2
                id='questions-title'
                className='mt-4 text-4xl sm:text-5xl font-bold leading-[1.04] tracking-tight text-slate-900'
              >
                {questions.title}
                <span className='text-rose-500'>{questions.accent}</span>
              </h2>

              <p className='mt-4 max-w-md text-sm sm:text-[15px] leading-relaxed text-zinc-600 text-pretty'>
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
