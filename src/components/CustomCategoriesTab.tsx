import CategoryManagerHeader from '@/components/CategoryManagerHeader'
import CategoryCreationForm from '@/components/CategoryCreationForm'
import CustomCategoryManager from '@/components/CustomCategoryManager'
import type { UserCustomCategory } from '@/server/db/schema'
import type { Test } from '@/types/dataTypes'

interface Props {
  initialCategories: UserCustomCategory[]
  questions: Test[]
}

export default function CustomCategoriesTab({ initialCategories, questions }: Props) {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="bg-white/90 backdrop-blur-md border border-zinc-200 rounded-xl p-4 shadow-sm">
        <CategoryManagerHeader />
        <div className="mt-4">
          <CategoryCreationForm />
        </div>
      </div>
      <CustomCategoryManager
        initialCategories={initialCategories}
        questions={questions}
      />
    </div>
  )
}
