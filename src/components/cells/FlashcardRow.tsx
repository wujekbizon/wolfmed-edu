'use client'

import { Pencil } from 'lucide-react'
import FlashcardEditForm from './FlashcardEditForm'
import FlashcardDeleteButton from './FlashcardDeleteButton'
import type { Flashcard } from '@/types/flashcardTypes'

interface FlashcardRowProps {
  card: Flashcard
  isEditing: boolean
  onStartEdit: () => void
  onCancel: () => void
}

export default function FlashcardRow({
  card,
  isEditing,
  onStartEdit,
  onCancel,
}: FlashcardRowProps) {
  if (isEditing) {
    return <FlashcardEditForm card={card} onDone={onCancel} />
  }

  return (
    <div className='bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex gap-4 items-start group'>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-zinc-900 mb-1'>{card.questionText}</p>
        <p className='text-sm text-zinc-500'>{card.answerText}</p>
      </div>
      <div className='flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
        <button
          type='button'
          onClick={onStartEdit}
          className='p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors cursor-pointer'
          title='Edytuj'
          aria-label='Edytuj fiszkę'
        >
          <Pencil className='w-3.5 h-3.5' />
        </button>
        <FlashcardDeleteButton cardId={card.id} deckId={card.deckId} />
      </div>
    </div>
  )
}
