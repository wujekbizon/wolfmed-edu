'use client'

import { useState, useActionState } from 'react'
import { saveAIGeneratedTestsAction } from '@/actions/actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useCellsStore } from '@/store/useCellsStore'
import TestQuestionEditor, { type DraftQuestion } from './TestQuestionEditor'
import type { Cell } from '@/types/cellTypes'
import ResizableComponent from '@/components/Resizable'

function parseQuestions(content: string): DraftQuestion[] {
  try {
    const parsed = JSON.parse(content)
    const raw = Array.isArray(parsed) ? parsed : parsed?.questions ?? []
    return raw.filter(
      (q: any) =>
        q?.data?.question &&
        Array.isArray(q?.data?.answers) &&
        q?.meta?.category
    )
  } catch {
    return []
  }
}

function blankDraft(category: string): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    data: {
      question: '',
      answers: Array(4).fill(null).map(() => ({ option: '', isCorrect: false })),
    },
    meta: { course: 'kategoria-wlasna', category },
  }
}

function ManualTestBuilder({ onAdd, onDiscard }: {
  onAdd: (q: DraftQuestion) => void
  onDiscard: () => void
}) {
  const [category, setCategory] = useState('')
  const [draft, setDraft] = useState<DraftQuestion | null>(null)

  const handleStart = () => {
    if (!category.trim()) return
    setDraft(blankDraft(category.trim()))
  }

  const handleSave = (q: DraftQuestion) => {
    onAdd(q)
    setDraft(blankDraft(category.trim()))
  }

  return (
    <div className="p-4 space-y-4">
      {!draft ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Nazwa kategorii
            </label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="np. Anatomia serca"
              className="mt-1 w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={!category.trim()}
              className="px-4 py-1.5 bg-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-40"
            >
              Dodaj pierwsze pytanie
            </button>
            <button
              type="button"
              onClick={onDiscard}
              className="px-4 py-1.5 border border-zinc-300 text-zinc-600 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Odrzuć
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
            {category}
          </span>
          <TestQuestionEditor
            question={draft}
            onSave={handleSave}
            onCancel={onDiscard}
          />
        </div>
      )}
    </div>
  )
}

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
      <div className="p-6 text-center text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
        ✓ Zapisano {questions.length} {questions.length === 1 ? 'pytanie' : 'pytań'} do kategorii &ldquo;{questions[0]?.meta?.category}&rdquo;
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
    <ResizableComponent direction="vertical">
    <div className="flex flex-col h-full bg-white p-3 pb-6 rounded shadow-xl border border-zinc-200/60">
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-700">
          {questions.length} {questions.length === 1 ? 'pytanie' : 'pytań'} wygenerowanych przez AI
        </span>
        <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
          {questions[0]?.meta?.category}
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm"
          >
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
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors text-xs"
                      title="Edytuj"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors text-xs"
                      title="Usuń"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {q.data.answers.map((a, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
                        a.isCorrect
                          ? 'bg-green-50 border border-green-200 text-zinc-800'
                          : 'bg-zinc-50 text-zinc-600'
                      }`}
                    >
                      <span className={`font-semibold ${a.isCorrect ? 'text-green-700' : 'text-zinc-400'}`}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span>{a.option}</span>
                      {a.isCorrect && (
                        <span className="ml-auto text-green-700 text-xs font-semibold">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {addingMore && (
        <TestQuestionEditor
          question={blankDraft(questions[0]?.meta?.category ?? '')}
          onSave={q => { setQuestions(prev => [...prev, q]); setAddingMore(false) }}
          onCancel={() => setAddingMore(false)}
        />
      )}

      {state.status === 'ERROR' && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {!addingMore && (
          <button
            type="button"
            onClick={() => setAddingMore(true)}
            className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
          >
            + Dodaj kolejne pytanie
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
    </div>
    </ResizableComponent>
  )
}
