'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import TestQuestionEditor, { type DraftQuestion } from '@/components/cells/TestQuestionEditor'
import { blankDraft } from '@/helpers/testCellHelpers'

interface ManualTestBuilderProps {
  onAdd: (q: DraftQuestion) => void
  onDiscard: () => void
}

export default function ManualTestBuilder({ onAdd, onDiscard }: ManualTestBuilderProps) {
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
              className="flex items-center gap-1.5 px-4 py-1.5 border border-zinc-200 text-zinc-500 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
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
