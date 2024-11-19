import { Test } from '@/types/dataTypes'
import DeleteIcon from './icons/DeleteIcon'
import EditableCategoryName from './EditableCategoryName'
import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'

interface Props {
  id: string
  name: string
  questionIds: string[]
  questions: Test[]
  onRemoveQuestion: (categoryId: string, questionId: string) => void
}

export default function CategoryCard({ id, name, questionIds, questions, onRemoveQuestion }: Props) {
  const { deleteCategory } = useQuestionSelectionStore()

  return (
    <div className="rounded-lg border border-zinc-600/20 bg-white/80 p-2 sm:p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-600">{questionIds.length} pytań</span>
        <button
          type="button"
          onClick={() => deleteCategory(id)}
          className="flex items-center justify-center hover:bg-red-100 cursor-pointer px-2 rounded transition-colors"
        >
          <DeleteIcon />
        </button>
      </div>
      <EditableCategoryName id={id} name={name} />
      <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-webkit mt-3">
        {questionIds.map((qId) => {
          const question = questions.find((q) => q.id === qId)
          return question ? (
            <div key={qId} className="flex items-center gap-2 text-sm p-2 bg-zinc-100/70 rounded">
              <p className="flex-1 line-clamp-2 text-zinc-700">{question.data.question}</p>
              <button
                onClick={() => onRemoveQuestion(id, qId)}
                className="text-zinc-400 hover:text-red-500 transition-colors shrink-0"
              >
                ×
              </button>
            </div>
          ) : null
        })}
      </div>
    </div>
  )
}
