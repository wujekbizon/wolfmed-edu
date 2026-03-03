'use client'

import { useState } from 'react'
import { BookOpen, Bot, LayersIcon } from 'lucide-react'
import { useFlashcardGroups, type FlashcardGroup } from '@/hooks/useFlashcardGroups'
import FlashcardReviewModal from './FlashcardReviewModal'
import type { FlashcardData } from '@/hooks/useFlashcards'

type Filter = 'all' | 'note' | 'cell'

interface FlashcardGroupCardProps {
  group: FlashcardGroup
  onReview: (cards: FlashcardData[]) => void
}

function FlashcardGroupCard({ group, onReview }: FlashcardGroupCardProps) {
  const Icon = group.source === 'cell' ? Bot : BookOpen
  const count = group.cards.length

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-zinc-200 hover:border-purple-200 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${group.source === 'cell' ? 'bg-purple-100' : 'bg-zinc-100'}`}>
          <Icon className={`w-4 h-4 ${group.source === 'cell' ? 'text-purple-600' : 'text-zinc-600'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{group.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {count} {count === 1 ? 'fiszka' : 'fiszek'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onReview(group.cards)}
        className="w-full px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
      >
        Przeglądaj
      </button>
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
          <LayersIcon className="w-5 h-5 text-purple-600" />
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
