import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'
import type { CategoryMetadata } from '@/types/categoryType'
import CategoryHeader from './CategoryHeader'
import CourseInfoSection from './CourseInfoSection'
import LearningOutcomesSection from './LearningOutcomesSection'
import ProgramContentSection from './ProgramContentSection'
import CategoryCTA from './CategoryCTA'

interface CategoryDetailViewProps {
  categoryData: CategoryMetadata
  categoryName: string
  testCount: number
  decodedCategory: string
  isPremium?: boolean
}

export default function CategoryDetailView({
  categoryData,
  categoryName,
  testCount,
  decodedCategory,
  isPremium = false,
}: CategoryDetailViewProps) {

  const competencies = categoryData?.details?.learningOutcomes.competencies ?? []
  return (
    <div className='max-w-6xl mx-auto'>
      <CategoryHeader
        categoryName={categoryName}
        categoryImage={categoryData.image}
        description={categoryData.description}
        popularity={categoryData.popularity}
        testCount={testCount}
      />

      {categoryData.details ? (
        <>
          <CourseInfoSection
            ects={categoryData.details.ects}
            semester={categoryData.details.semester}
            objectives={categoryData.details.objectives}
            prerequisites={categoryData.details.prerequisites}
          />

          <LearningOutcomesSection
            knowledge={categoryData.details.learningOutcomes.knowledge}
            skills={categoryData.details.learningOutcomes.skills}
            competencies={competencies}
          />

          <div className='bg-white rounded-lg shadow-md p-4 md:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between'>
            <div>
              <p className='text-sm font-semibold text-gray-800'>
                Przygotowujesz się z tego przedmiotu?
              </p>
              <p className='text-xs text-gray-500'>
                Rozłóż program na dni nauki i śledź postępy w Planie Nauki.
              </p>
            </div>
            <Link
              href={`/panel/plan?zakres=${encodeURIComponent(decodedCategory)}`}
              className='inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors whitespace-nowrap self-start sm:self-auto'
            >
              <CalendarCheck className='w-4 h-4' />
              Zaplanuj naukę tego przedmiotu
            </Link>
          </div>

          <ProgramContentSection
            lectures={categoryData.details.programContent.lectures}
            seminars={categoryData.details.programContent.seminars}
            selfStudy={categoryData.details.programContent.selfStudy}
            categoryId={decodedCategory}
            isPremium={isPremium}
          />

          <CategoryCTA categoryName={categoryName} />
        </>
      ) : (
        <CategoryCTA categoryName={categoryName} />
      )}
    </div>
  )
}
