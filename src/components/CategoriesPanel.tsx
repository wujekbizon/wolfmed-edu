import { Test } from '@/types/dataTypes'
import CategoryCard from './CategoryCard'

interface Props {
  categories: {
    id: string
    name: string
    questionIds: string[]
  }[]
  questions: Test[]
}

export default function CategoriesPanel({ categories, questions }: Props) {
  return (
    <div className="lg:w-1/3 space-y-2 sm:space-y-4 rounded-xl bg-zinc-200/50 backdrop-blur-md border border-zinc-600/20 p-2 sm:p-4 shadow-md">
      <div className="flex-1">
        <div className="space-y-2 sm:space-y-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              questionIds={category.questionIds}
              questions={questions}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
