'use client'

import { useState } from 'react'
import { useFlashcardDecks } from '@/hooks/useFlashcardDecks'
import { useFlashcardReviewStore } from '@/store/useFlashcardReviewStore'
import { FLASHCARD_FILTERS } from '@/constants/flashcards'
import FlashcardDeckCard from './FlashcardDeckCard'
import type { FlashcardDeck } from '@/types/flashcardTypes'

type Filter = (typeof FLASHCARD_FILTERS)[number]['value']

export default function FlashcardsSection({ initialDecks }: { initialDecks: FlashcardDeck[] }) {
  const decks = useFlashcardDecks(initialDecks)
  const openReview = useFlashcardReviewStore((s) => s.openReview)
  const [filter, setFilter] = useState<Filter>('all')

  if (decks.length === 0) return null

  const visible =
    filter === 'all' ? decks : decks.filter((deck) => deck.sourceType === filter)

  return (
    <section className='bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-zinc-200/60'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold text-zinc-800'>Fiszki</h2>
        <div className='flex items-center gap-1 bg-zinc-100 rounded-lg p-1'>
          {FLASHCARD_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type='button'
              onClick={() => setFilter(value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filter === value
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className='text-sm text-zinc-400 py-4 text-center'>Brak fiszek w tej kategorii</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {visible.map((deck) => (
            <FlashcardDeckCard
              key={deck.id}
              deck={deck}
              onReview={() => openReview(deck.cards)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
