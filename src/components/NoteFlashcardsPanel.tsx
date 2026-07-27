'use client'

import { Layers } from 'lucide-react'
import { useNoteFlashcardDeck } from '@/hooks/useNoteFlashcardDeck'
import { useFlashcardReviewStore } from '@/store/useFlashcardReviewStore'
import Button from './ui/Button'
import type { FlashcardDeck } from '@/types/flashcardTypes'

interface NoteFlashcardsPanelProps {
  noteId: string
  initialDeck: FlashcardDeck | null
}

export default function NoteFlashcardsPanel({ noteId, initialDeck }: NoteFlashcardsPanelProps) {
  const { cards } = useNoteFlashcardDeck(noteId, initialDeck)
  const openReview = useFlashcardReviewStore((s) => s.openReview)

  return (
    <div className='bg-white rounded-xl shadow-sm border border-zinc-200 p-4'>
      <div className='flex items-center gap-2 mb-3'>
        <Layers className='w-4 h-4 text-[#f58a8a]' />
        <h2 className='text-sm font-semibold text-zinc-800'>Fiszki</h2>
        <span className='ml-auto text-sm font-semibold text-zinc-500'>{cards.length}</span>
      </div>

      {cards.length === 0 ? (
        <p className='text-xs text-zinc-400'>
          Zaznacz tekst w trybie nauki, aby utworzyć pierwszą fiszkę.
        </p>
      ) : (
        <Button
          variant='secondary'
          size='sm'
          className='w-full'
          onClick={() => openReview(cards)}
        >
          Przeglądaj
        </Button>
      )}
    </div>
  )
}
