'use client'

import { useActionState } from 'react'
import { addQuestionToCategoryAction, removeQuestionFromCategoryAction } from '@/actions/actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FormError from './FormError'
import { useToastMessage } from '@/hooks/useToastMessage'

interface Props {
  categoryId: string
  categoryName: string
  questionId: string
  isAdded: boolean
}

export default function CategoryToggleButton({ categoryId, categoryName, questionId, isAdded }: Props) {
  const [addState, addAction] = useActionState(addQuestionToCategoryAction, EMPTY_FORM_STATE)
  const [removeState, removeAction] = useActionState(removeQuestionFromCategoryAction, EMPTY_FORM_STATE)
  const addFallback = useToastMessage(addState)
  const removeFallback = useToastMessage(removeState)

  const action = isAdded ? removeAction : addAction
  const state = isAdded ? removeState : addState

  return (
    <form action={action}>
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="questionId" value={questionId} />
      <button
        type="submit"
        className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
          isAdded
            ? 'bg-[#ffc5c5]/70 backdrop-blur-sm text-zinc-800 hover:bg-[#f58a8a]/70 border border-red-100/20'
            : 'bg-zinc-100/70 text-zinc-700 hover:bg-zinc-200/70 border border-zinc-600/20'
        }`}
      >
        {categoryName}
      </button>
      <FormError formState={state} />
      {addFallback}
      {removeFallback}
    </form>
  )
}
