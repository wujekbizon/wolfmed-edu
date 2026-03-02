'use client'

import { useRef } from 'react'
import { Pencil, Trash2, Check, CheckCircle2 } from 'lucide-react'
import { useCellsStore } from '@/store/useCellsStore'
import { useTestCellStore } from '@/store/useTestCellStore'
import TestQuestionEditor from './TestQuestionEditor'
import ManualTestBuilder from '@/components/ManualTestBuilder'
import SaveTestForm from './SaveTestForm'
import { parseQuestions, blankDraft } from '@/helpers/testCellHelpers'
import type { Cell } from '@/types/cellTypes'

export default function TestCellPreview({ cell }: { cell: Cell }) {
  const { deleteCell } = useCellsStore()

  const initialized = useRef(false)
  if (!initialized.current) {
    initialized.current = true
    useTestCellStore.getState().initCell(cell.id, parseQuestions(cell.content))
  }

  const { cells, setEditingId, removeQuestion, updateQuestion, addQuestion, setAddingMore } = useTestCellStore()
  const { questions = [], editingId = null, saved = false, addingMore = false } = cells[cell.id] ?? {}

  if (!questions.length) {
    return (
      <ManualTestBuilder
        onAdd={(q) => addQuestion(cell.id, q)}
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
                onSave={(updated) => updateQuestion(cell.id, updated)}
                onCancel={() => setEditingId(cell.id, null)}
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
                      onClick={() => setEditingId(cell.id, q.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                      title="Edytuj"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(cell.id, q.id)}
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
                      {a.isCorrect && <Check className="ml-auto w-3 h-3 text-green-600 shrink-0" />}
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
            onSave={(q) => addQuestion(cell.id, q)}
            onCancel={() => setAddingMore(cell.id, false)}
          />
        )}
      </div>

      <SaveTestForm cellId={cell.id} onDiscard={() => deleteCell(cell.id)} />
    </div>
  )
}
