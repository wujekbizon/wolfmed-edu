'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'
import { saveAIGeneratedTestsAction } from '@/actions/actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from '@/components/SubmitButton'
import FieldError from '@/components/FieldError'
import { useTestCellStore } from '@/store/useTestCellStore'

interface Props {
  cellId: string
  onDiscard: () => void
}

export default function SaveTestForm({ cellId, onDiscard }: Props) {
  const [state, action] = useActionState(saveAIGeneratedTestsAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  const { cells, setAddingMore, setSaved } = useTestCellStore()
  const { questions = [], addingMore = false } = cells[cellId] ?? {}

  const prevTimestamp = useRef(state.timestamp)
  useEffect(() => {
    if (state.status === 'SUCCESS' && state.timestamp !== prevTimestamp.current) {
      prevTimestamp.current = state.timestamp
      setSaved(cellId)
    }
  }, [state.timestamp])

  const handleSave = async (formData: FormData) => {
    formData.set('questionsJson', JSON.stringify(questions))
    await action(formData)
  }

  return (
    <div className="pt-3 mt-3 border-t border-zinc-100 space-y-2">
      <FieldError name="questionsJson" formState={state} />
      <div className="flex flex-wrap gap-2 items-center">
        {!addingMore && (
          <button
            type="button"
            onClick={() => setAddingMore(cellId, true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-zinc-300 text-zinc-700 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dodaj pytanie
          </button>
        )}
        <form action={handleSave} className="flex gap-2 flex-1">
          <SubmitButton
            label="Zapisz wszystkie"
            loading="Zapisywanie..."
            disabled={!questions.length}
          />
          <button
            type="button"
            onClick={onDiscard}
            className="px-5 py-2 border border-zinc-300 text-zinc-600 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Odrzuć
          </button>
        </form>
      </div>
      {noScriptFallback}
    </div>
  )
}
