'use client'

import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'
import CategoryTestButton from './CategoryTestButton'

interface CustomTestOptionsProps {
  isLoading?: boolean
  onSelectCategory: (categoryId: string) => void
  selectedCategory: string | null
}

export default function CustomTestOptions({ isLoading, onSelectCategory, selectedCategory }: CustomTestOptionsProps) {
  const { customCategories } = useQuestionSelectionStore()

  if (customCategories.length === 0) {
    return (
      <div className="text-center p-8 bg-zinc-100 rounded-lg border border-zinc-200">
        <p className="text-lg text-zinc-900">Nie masz jeszcze żadnych kategorii pytań.</p>
        <p className="text-sm text-zinc-500 mt-2">Możesz dodać własne kategorie w zakładce &quot;Wybrane&quot;.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <h4 className="text-center text-2xl font-medium text-zinc-900">Moje kategorie pytań</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customCategories.map((category) => (
          <CategoryTestButton
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onSelect={onSelectCategory}
            disabled={isLoading ?? false}
          />
        ))}
      </div>
    </div>
  )
}
