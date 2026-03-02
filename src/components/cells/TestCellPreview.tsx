'use client'

import { useState, useActionState } from 'react'
import { Pencil, Trash2, Check, CheckCircle2, Plus } from 'lucide-react'
import { saveAIGeneratedTestsAction } from '@/actions/actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useCellsStore } from '@/store/useCellsStore'
import TestQuestionEditor, { type DraftQuestion } from './TestQuestionEditor'
import ManualTestBuilder from '@/components/ManualTestBuilder'
import { parseQuestions, blankDraft } from '@/helpers/testCellHelpers'
import type { Cell } from '@/types/cellTypes'

export default function TestCellPreview({ cell }: { cell: Cell }) {
  const { deleteCell } = useCellsStore()
  const [state, action, isPending] = useActionState(saveAIGeneratedTestsAction, EMPTY_FORM_STATE)
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => parseQuestions(cell.content))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [addingMore, setAddingMore] = useState(false)

  if (questions.length === 0) {
    return (
      <ManualTestBuilder
        onAdd={q => setQuestions([q])}
        onDiscard={() => deleteCell(cell.id)}
      />
    )
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-full text-sm text-green-700">
        <CheckCircle2 className="w-6 h-6 text-green-600" />
        <span>
          Zapisano {questions.length} {questions.length === 1 ? 'pytanie' : 'pytań'} do kategorii &ldquo;{questions[0]?.meta?.category}&rdquo;
        </span>
      </div>
    )
  }

  const handleSave = async (formData: FormData) => {
    formData.set('questionsJson', JSON.stringify(questions))
    await action(formData)
    setSaved(true)
  }

  const removeQuestion = (id: string) =>
    setQuestions(prev => prev.filter(q => q.id !== id))

  const updateQuestion = (updated: DraftQuestion) => {
    setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q))
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-700">
          {questions.length} {questions.length === 1 ? 'pytanie' : 'pytań'} wygenerowanych przez AI
        </span>
        <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
          {questions[0]?.meta?.category}
        </span>
      </div>

      <div className="overflow-y-auto flex-1 space-y-3 pr-1">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            {editingId === q.id ? (
              <TestQuestionEditor
                question={q}
                onSave={updateQuestion}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="flex justify-between items-start gap-3 mb-3">
                  <p className="text-sm font-semibold text-zinc-900">
                    <span className="text-zinc-400 mr-2">{idx + 1}.</span>
                    {q.data.question}
                  </p>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingId(q.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                      title="Edytuj"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {q.data.answers.map((a, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        a.isCorrect
                          ? 'bg-green-50 border border-green-200 text-zinc-800'
                          : 'bg-white border border-zinc-100 text-zinc-600'
                      }`}
                    >
                      <span className={`font-semibold shrink-0 ${a.isCorrect ? 'text-green-700' : 'text-zinc-400'}`}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span>{a.option}</span>
                      {a.isCorrect && (
                        <Check className="ml-auto w-3 h-3 text-green-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}

        {addingMore && (
          <TestQuestionEditor
            question={blankDraft(questions[0]?.meta?.category ?? '')}
            onSave={q => { setQuestions(prev => [...prev, q]); setAddingMore(false) }}
            onCancel={() => setAddingMore(false)}
          />
        )}
      </div>

      {state.status === 'ERROR' && (
        <p className="text-sm text-red-600 mt-2">{state.message}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-zinc-100">
        {!addingMore && (
          <button
            type="button"
            onClick={() => setAddingMore(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-zinc-300 text-zinc-700 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dodaj pytanie
          </button>
        )}
        <form action={handleSave} className="flex gap-2">
          <button
            type="submit"
            disabled={isPending || questions.length === 0}
            className="px-5 py-2 bg-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Zapisywanie...' : 'Zapisz wszystkie'}
          </button>
          <button
            type="button"
            onClick={() => deleteCell(cell.id)}
            className="px-5 py-2 border border-zinc-300 text-zinc-600 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Odrzuć
          </button>
        </form>
      </div>
    </div>
  )
}
