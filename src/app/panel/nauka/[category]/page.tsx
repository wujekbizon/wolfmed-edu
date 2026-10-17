import { Suspense } from 'react'
import type { Metadata } from 'next'
import CategoryContent from '@/components/learning/CategoryContent'
import PracticePlan from '@/components/learning/PracticePlan'
import LearningPracticeSkeleton from '@/components/skeletons/LearningPracticeSkeleton'
import type { LearningCategoryProps } from '@/types/learningPracticeTypes'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: LearningCategoryProps): Promise<Metadata> {
  const { category } = await params
  return { title: `Nauka: ${decodeURIComponent(category).replace(/-/g, ' ')}` }
}

export default function CategoryPage(props: LearningCategoryProps) {
  return <section className="learning-category-page flex w-full flex-col items-center gap-8 p-4 lg:p-16">
    <Suspense fallback={<LearningPracticeSkeleton />}>
      <CategoryContent {...props} />
    </Suspense>
    <Suspense fallback={<LearningPracticeSkeleton />}>
      <PracticePlan {...props} />
    </Suspense>
  </section>
}
