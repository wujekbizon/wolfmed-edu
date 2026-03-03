'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { Flashcard } from '@/store/useFlashcardStore'

interface FlashcardRowProps {
  card: Flashcard
  isEditing: boolean
  onStartEdit: () => void
  onSave: (questionText: string, answerText: string) => void
  onCancel: () => void
  onDelete: () => void
}

export default function FlashcardRow({
  card,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
}: FlashcardRowProps) {
  const [editQ, setEditQ] = useState(card.questionText)
  const [editA, setEditA] = useState(card.answerText)

  useEffect(() => {
    if (isEditing) {
      setEditQ(card.questionText)
      setEditA(card.answerText)
    }
  }, [isEditing, card.questionText, card.answerText])

  if (isEditing) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
        <textarea
          value={editQ}
          onChange={(e) => setEditQ(e.target.value)}
          placeholder="Pytanie"
          rows={2}
          className="w-full text-sm px-3 py-2 border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <textarea
          value={editA}
          onChange={(e) => setEditA(e.target.value)}
          placeholder="Odpowiedź"
          rows={2}
          className="w-full text-sm px-3 py-2 border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <X className="w-3 h-3" />
            Anuluj
          </button>
          <button
            type="button"
            onClick={() => onSave(editQ.trim(), editA.trim())}
            disabled={!editQ.trim() || !editA.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-3 h-3" />
            Zapisz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex gap-4 items-start group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 mb-1">{card.questionText}</p>
        <p className="text-sm text-zinc-500">{card.answerText}</p>
      </div>
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onStartEdit}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
          title="Edytuj"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Usuń"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
