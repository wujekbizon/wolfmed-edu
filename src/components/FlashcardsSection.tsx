'use client'

import { useState } from 'react'
import { Trash2Icon } from 'lucide-react'
import {
  useFlashcardGroups,
  type FlashcardGroup
} from '@/hooks/useFlashcardGroups'
import { useFlashcardStore } from '@/store/useFlashcardStore'
import FlashcardReviewModal from './FlashcardReviewModal'
import type { FlashcardData } from '@/hooks/useFlashcards'

type Filter = 'all' | 'note' | 'cell'

interface FlashcardGroupCardProps {
  group: FlashcardGroup
  onReview: (cards: FlashcardData[]) => void
  onRemove: (group: FlashcardGroup) => void
}

function FlashcardGroupCard({
  group,
  onReview,
  onRemove
}: FlashcardGroupCardProps) {
  const count = group.cards.length
  const preview = group.cards[0]?.questionText

  return (
    <div className='flex flex-col justify-evenly gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 p-5'>
      <div className='flex justify-between items-start'>
        <h3 className='text-zinc-800 font-semibold text-lg leading-tight line-clamp-1'>
          {group.name}
        </h3>
        <span className='text-sm font-semibold px-3 py-1 text-zinc-700'>
          {count}
        </span>
      </div>
      {preview && (
        <p className='text-zinc-600 text-sm leading-relaxed line-clamp-3'>
          {preview}
        </p>
      )}
      <div className='flex justify-between'>
        <button
          type='button'
          onClick={() => onReview(group.cards)}
          className='px-3 py-1 cursor-pointer text-xs font-medium bg-gradient-to-r from-[#ff9898]/20 to-fuchsia-100 text-[#e07070] hover:from-[#ff9898]/30 transition-color rounded transition-colors'
        >
          Przeglądaj
        </button>
        <button
          type='button'
          onClick={() => onRemove(group)}
          className='p-1.5 text-zinc-600 cursor-pointer hover:text-red-500 hover:bg-red-50 rounded transition-colors'
          aria-label='Usuń grupę fiszek'
        >
          <Trash2Icon size={16} />
        </button>
      </div>
    </div>
  )
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'note', label: 'Notatki' },
  { value: 'cell', label: 'AI' }
]

interface FlashcardsSectionProps {
  notes: { id: string; title: string }[]
}

export default function FlashcardsSection({ notes }: FlashcardsSectionProps) {
  const { groups, hasAny } = useFlashcardGroups(notes)
  const removeFlashcard = useFlashcardStore((s) => s.removeFlashcard)
  const clearFlashcardsByNoteId = useFlashcardStore(
    (s) => s.clearFlashcardsByNoteId
  )
  const [filter, setFilter] = useState<Filter>('all')
  const [reviewCards, setReviewCards] = useState<FlashcardData[] | null>(null)

  function handleRemoveGroup(group: FlashcardGroup) {
    if (group.source === 'note') {
      clearFlashcardsByNoteId(group.id)
    } else {
      group.cards.forEach((card) => removeFlashcard(card.cardId))
    }
  }

  if (!hasAny) return null

  const visible =
    filter === 'all' ? groups : groups.filter((g) => g.source === filter)

  return (
    <section className='bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-zinc-200/60'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <h2 className='text-xl font-bold text-zinc-800'>Fiszki</h2>
        </div>
        <div className='flex items-center gap-1 bg-zinc-100 rounded-lg p-1'>
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type='button'
              onClick={() => setFilter(value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
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
        <p className='text-sm text-zinc-400 py-4 text-center'>
          Brak fiszek w tej kategorii
        </p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {visible.map((group) => (
            <FlashcardGroupCard
              key={group.id}
              group={group}
              onReview={setReviewCards}
              onRemove={handleRemoveGroup}
            />
          ))}
        </div>
      )}

      {reviewCards && (
        <FlashcardReviewModal
          flashcards={reviewCards}
          onClose={() => setReviewCards(null)}
        />
      )}
    </section>
  )
}
