'use client'

import { useState } from 'react'
import { useFlashcardCell } from '@/hooks/useFlashcardCell'
import { Plus } from 'lucide-react'
import FlashcardRow from './FlashcardRow'
import { Textarea } from '../ui/Textarea'
import type { Cell } from '@/types/cellTypes'
import Label from '../ui/Label'

export default function FlashcardCellPreview({ cell }: { cell: Cell }) {
  const { cards, topic, updateFlashcard, removeFlashcard, addCard } =
    useFlashcardCell(cell.id, cell.content)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')

  const handleSave = (id: string, q: string, a: string) => {
    if (!q || !a) return
    updateFlashcard(id, q, a)
    setEditingId(null)
  }

  const handleAdd = () => {
    if (!newQ.trim() || !newA.trim()) return
    addCard(newQ.trim(), newA.trim())
    setNewQ('')
    setNewA('')
    setIsAdding(false)
  }

  return (
    <div className='flex flex-col h-full'>
      {cards.length === 0 && !isAdding ? (
        <div className='flex flex-col items-center justify-center flex-1 text-center'>
          <h3 className='text-xl text-zinc-500 mb-2 font-medium'>
            Brak dostępnych fiszek
          </h3>
          <p className='text-zinc-400'>Dodaj pierwszą fiszkę!</p>
        </div>
      ) : (
        <div className='overflow-y-auto flex-1 space-y-2 pr-1'>
          {cards.map((card) => (
            <FlashcardRow
              key={card.id}
              card={card}
              isEditing={editingId === card.id}
              onStartEdit={() => setEditingId(card.id)}
              onSave={(q, a) => handleSave(card.id, q, a)}
              onCancel={() => setEditingId(null)}
              onDelete={() => removeFlashcard(card.id)}
            />
          ))}

          {isAdding && (
            <div className='bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 backdrop-blur-sm rounded-xl p-4 space-y-2'>
              <Label label='Pytanie:' htmlFor='new-question' />
              <Textarea
                id='new-question'
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                placeholder='Dodaj pytanie do fiszki'
              />
              <Label label='Odpowiedź:' htmlFor='new-answer' />
              <Textarea
                id='new-answer'
                value={newA}
                onChange={(e) => setNewA(e.target.value)}
                placeholder='Dodaj odpowiedź do fiszki'
              />

              <div className='flex gap-2 justify-end'>
                <button
                  type='button'
                  onClick={() => {
                    setIsAdding(false)
                    setNewQ('')
                    setNewA('')
                  }}
                  className='inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-white hover:bg-zinc-100 px-4 py-2 text-lg font-medium border text-black shadow transition-colors cursor-pointer hover:border-zinc-800 border-red-200/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Anuluj
                </button>
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={!newQ.trim() || !newA.trim()}
                  className='inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#f58a8a] hover:bg-[#ff5b5b] px-4 py-2 text-lg font-medium border text-black shadow transition-colors cursor-pointer hover:border-zinc-800 border-red-200/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Dodaj
                </button>
              </div>
            </div>
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
