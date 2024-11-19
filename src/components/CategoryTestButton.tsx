'use client'

import { useGenerateTestStore } from '@/store/useGenerateTestStore'
import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'
import { testsMenu } from '@/constants/testsMenu'
import DeleteIcon from './icons/DeleteIcon'

interface Props {
  category: {
    id: string
    name: string
    questionIds: string[]
  }
  isSelected: boolean
  onSelect: (categoryId: string) => void
  disabled?: boolean
}

export default function CategoryTestButton({ category, isSelected, onSelect, disabled }: Props) {
  const { setNumberTests, setIsTest } = useGenerateTestStore()
  const { deleteCategory } = useQuestionSelectionStore()

  const handleGenerateTest = (questionCount: number) => {
    if (category.questionIds.length < questionCount) {
      questionCount = category.questionIds.length
    }
    onSelect(category.id)
    setNumberTests(questionCount)
    setIsTest(true)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteCategory(category.id)
  }

  return (
    <div
      className={`p-4 rounded-lg border transition-all group ${
        isSelected
          ? 'border-red-200 bg-white shadow-md'
          : 'bg-zinc-600 border border-zinc-600/20 hover:border-zinc-300/90 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <h3 className="font-medium text-zinc-100">{category.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300">{category.questionIds.length} pytań</span>
              <button onClick={handleDeleteClick} className="p-1 rounded-full hover:bg-zinc-700" title="Usuń kategorię">
                <DeleteIcon color="rgb(228 228 231)" width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {testsMenu.map((m) => (
            <button
              key={m.number}
              onClick={() => handleGenerateTest(m.number)}
              disabled={disabled || category.questionIds.length < m.number}
              className={`text-sm px-3 py-2 rounded-md transition-colors text-center
                ${
                  disabled || category.questionIds.length < m.number
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-100 text-zinc-800 hover:bg-red-200 active:bg-red-200'
                }
              `}
            >
              {m.testTitle}{' '}
              {category.questionIds.length < m.number && (
                <span className="text-zinc-500 text-xs ml-1">{`(dostępne: ${category.questionIds.length})`}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
