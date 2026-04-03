'use client'

import { useState } from 'react'
import TestQuestionEditor, {
  type DraftQuestion
} from '@/components/cells/TestQuestionEditor'
import { blankDraft } from '@/helpers/testCellHelpers'
import Label from './ui/Label'

interface ManualTestBuilderProps {
  onAdd: (q: DraftQuestion) => void
  onDiscard: () => void
}

export default function ManualTestBuilder({
  onAdd,
  onDiscard
}: ManualTestBuilderProps) {
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
    <div className='p-4 space-y-4'>
      {!draft ? (
        <div className='space-y-3'>
          <div>
            <Label
              label='Nazwa kategorii'
              htmlFor='category'
              className='block text-sm font-medium text-zinc-700'
            />
            <input
              id='category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder='np. Anatomia, Patologia, Farmakologia...'
              className='w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/90 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm'
            />
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleStart}
              disabled={!category.trim()}
              className='inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#f58a8a] hover:bg-[#ff5b5b] px-4 py-2 text-lg font-medium border text-black shadow transition-colors cursor-pointer hover:border-zinc-800 border-red-200/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Dodaj pytanie
            </button>
            <button
              type='button'
              onClick={onDiscard}
              className='inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-white hover:bg-zinc-100 px-4 py-2 text-lg font-medium border text-black shadow transition-colors cursor-pointer hover:border-zinc-800 border-red-200/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Odrzuć
            </button>
          </div>
        </div>
      ) : (
        <div className='space-y-2'>
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
