'use client'

import { useState } from 'react'
import { LayersIcon } from 'lucide-react'
import { useFlashcardGroups, type FlashcardGroup } from '@/hooks/useFlashcardGroups'
import FlashcardReviewModal from './FlashcardReviewModal'
import type { FlashcardData } from '@/hooks/useFlashcards'

type Filter = 'all' | 'note' | 'cell'

interface FlashcardGroupCardProps {
  group: FlashcardGroup
  onReview: (cards: FlashcardData[]) => void
}

function FlashcardGroupCard({ group, onReview }: FlashcardGroupCardProps) {
  const count = group.cards.length
  const preview = group.cards[0]?.questionText

  return (
    <div className="relative bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 p-5 pb-10">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-zinc-800 font-semibold text-lg leading-tight line-clamp-1">
          {group.name}
        </h3>
        <span className="shrink-0 ml-2 text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300/60">
          {count} {count === 1 ? 'fiszka' : 'fiszek'}
        </span>
      </div>
      {preview && (
        <p className="text-zinc-600 text-sm leading-relaxed line-clamp-3">
          {preview}
        </p>
      )}
      <div className="absolute bottom-3 right-3">
        <button
          type="button"
          onClick={() => onReview(group.cards)}
          className="px-3 py-1 text-xs font-medium bg-red-500/40 hover:bg-red-500/70 rounded transition-colors"
        >
          Przeglądaj
        </button>
      </div>
    </div>
  )
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'note', label: 'Notatki' },
  { value: 'cell', label: 'AI' },
]

interface FlashcardsSectionProps {
  notes: { id: string; title: string }[]
}

export default function FlashcardsSection({ notes }: FlashcardsSectionProps) {
  const { groups, hasAny } = useFlashcardGroups(notes)
  const [filter, setFilter] = useState<Filter>('all')
  const [reviewCards, setReviewCards] = useState<FlashcardData[] | null>(null)

  if (!hasAny) return null

  const visible = filter === 'all' ? groups : groups.filter((g) => g.source === filter)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LayersIcon className="w-5 h-5 text-zinc-600" />
          <h2 className="text-xl font-bold text-zinc-800">Fiszki</h2>
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
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
        <p className="text-sm text-zinc-400 py-4 text-center">
          Brak fiszek w tej kategorii
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {visible.map((group) => (
            <FlashcardGroupCard
              key={group.id}
              group={group}
              onReview={setReviewCards}
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
