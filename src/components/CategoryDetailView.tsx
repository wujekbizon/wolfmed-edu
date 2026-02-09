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
}

export default function CategoryDetailView({
  categoryData,
  categoryName,
  testCount,
  decodedCategory,
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

          <ProgramContentSection
            lectures={categoryData.details.programContent.lectures}
            seminars={categoryData.details.programContent.seminars}
            selfStudy={categoryData.details.programContent.selfStudy}
            categoryId={decodedCategory}
          />

          <CategoryCTA categoryName={categoryName} />
        </>
      ) : (
        <CategoryCTA categoryName={categoryName} />
      )}
    </div>
  )
}
