'use client'

import { useActionState } from 'react'
import { removeQuestionFromCategoryAction } from '@/actions/actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { Test } from '@/types/dataTypes'
import CategoryDeleteButton from './CategoryDeleteButton'
import EditableCategoryName from './EditableCategoryName'

interface Props {
  id: string
  name: string
  questionIds: string[]
  questions: Test[]
}

export default function CategoryCard({ id, name, questionIds, questions }: Props) {
  const [, removeAction] = useActionState(removeQuestionFromCategoryAction, EMPTY_FORM_STATE)

  return (
    <div className="rounded-lg border border-zinc-600/20 bg-white/80 p-2 sm:p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-600">{questionIds.length} pytań</span>
        <CategoryDeleteButton categoryId={id} />
      </div>
      <EditableCategoryName id={id} name={name} />
      <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-webkit mt-3">
        {questionIds.map((qId) => {
          const question = questions.find((q) => q.id === qId)
          return question ? (
            <div key={qId} className="flex items-center gap-2 text-sm p-2 bg-zinc-100/70 rounded">
              <p className="flex-1 line-clamp-2 text-zinc-700">{question.data.question}</p>
              <form action={removeAction}>
                <input type="hidden" name="categoryId" value={id} />
                <input type="hidden" name="questionId" value={qId} />
                <button
                  type="submit"
                  className="text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                >
                  ×
                </button>
              </form>
            </div>
          ) : null
        })}
      </div>
    </div>
  )
}
