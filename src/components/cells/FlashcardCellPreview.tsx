'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useCellsStore } from '@/store/useCellsStore'
import { useFlashcardCell } from '@/hooks/useFlashcardCell'
import FlashcardRow from './FlashcardRow'
import type { Cell } from '@/types/cellTypes'

export default function FlashcardCellPreview({ cell }: { cell: Cell }) {
  const { deleteCell } = useCellsStore()
  const { cards, topic, updateFlashcard, removeFlashcard, addCard } = useFlashcardCell(cell.id, cell.content)
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-700">
          {cards.length} {cards.length === 1 ? 'fiszka' : 'fiszek'} wygenerowanych przez AI
        </span>
        {topic && (
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            {topic}
          </span>
        )}
      </div>

      <div className="overflow-y-auto flex-1 space-y-2 pr-1">
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
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
            <textarea
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              placeholder="Pytanie"
              rows={2}
              autoFocus
              className="w-full text-sm px-3 py-2 border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <textarea
              value={newA}
              onChange={(e) => setNewA(e.target.value)}
              placeholder="Odpowiedź"
              rows={2}
              className="w-full text-sm px-3 py-2 border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setNewQ(''); setNewA('') }}
                className="px-3 py-1.5 text-xs text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newQ.trim() || !newA.trim()}
                className="px-3 py-1.5 text-xs text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dodaj
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Dodaj fiszkę
        </button>
        <button
          type="button"
          onClick={() => deleteCell(cell.id)}
          className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Usuń komórkę
        </button>
      </div>
    </div>
  )
}
