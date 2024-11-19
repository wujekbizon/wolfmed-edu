import { Test } from '@/types/dataTypes'
import CategoryCard from './CategoryCard'
import CategoryCreationForm from './CategoryCreationForm'
import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'

interface Props {
  questions: Test[]
}

export default function CategoriesPanel({ questions }: Props) {
  const { customCategories, removeQuestionFromCategory } = useQuestionSelectionStore()

  return (
    <div className="lg:w-1/3 space-y-2 sm:space-y-4 rounded-xl bg-zinc-200/50 backdrop-blur-md border border-zinc-600/20 p-2 sm:p-4 shadow-md">
      <CategoryCreationForm />
      <div className="flex-1">
        <div className="space-y-2 sm:space-y-4">
          {customCategories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              questionIds={category.questionIds}
              questions={questions}
              onRemoveQuestion={removeQuestionFromCategory}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
