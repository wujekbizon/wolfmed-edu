'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFlashcardCell } from '@/hooks/useFlashcardCell'
import { useCellsStore } from '@/store/useCellsStore'
import FlashcardRow from './FlashcardRow'
import FlashcardAddForm from './FlashcardAddForm'
import FlashcardCellEmpty from './FlashcardCellEmpty'
import FlashcardCellCreateDeck from './FlashcardCellCreateDeck'
import type { Cell } from '@/types/cellTypes'

export default function FlashcardCellPreview({ cell }: { cell: Cell }) {
  const { deckId, deck, cards, topic, isLoading } = useFlashcardCell(cell.content)
  const updateCell = useCellsStore((s) => s.updateCell)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  if (!deckId) {
    return (
      <FlashcardCellCreateDeck
        onCreated={(newDeckId) => updateCell(cell.id, JSON.stringify({ deckId: newDeckId }))}
      />
    )
  }

  if (isLoading) return <FlashcardCellEmpty variant='loading' />
  if (!deck) return <FlashcardCellEmpty variant='missing' />

  return (
    <div className='flex flex-col h-full'>
      <h3 className='text-sm font-semibold text-zinc-700 mb-2 line-clamp-1'>{topic}</h3>

      {cards.length === 0 && !isAdding ? (
        <FlashcardCellEmpty variant='empty' />
      ) : (
        <div className='overflow-y-auto flex-1 space-y-2 pr-1'>
          {cards.map((card) => (
            <FlashcardRow
              key={card.id}
              card={card}
              isEditing={editingId === card.id}
              onStartEdit={() => setEditingId(card.id)}
              onCancel={() => setEditingId(null)}
            />
          ))}

          {isAdding && (
            <FlashcardAddForm deckId={deckId} onDone={() => setIsAdding(false)} />
          )}
        </div>
      )}

      <div className='flex items-center justify-between pt-3 mt-2 border-t border-zinc-100'>
        <button
          type='button'
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className='inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-700 cursor-pointer transition-colors disabled:opacity-50'
        >
          <Plus className='w-3.5 h-3.5' />
          Dodaj fiszkę
        </button>
      </div>
    </div>
  )
}
