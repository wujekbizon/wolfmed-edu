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
    <article className="relative flex flex-col justify-between gap-3 px-3 pt-8 pb-3 bg-zinc-50 rounded-xl border border-zinc-300/50 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
      <span className="absolute top-1 right-1 bg-zinc-800/80 text-zinc-100 px-2 py-0.5 rounded-full border border-zinc-700 text-[11px] font-semibold">
        {count} {count === 1 ? 'fiszka' : 'fiszek'}
      </span>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg shrink-0 bg-zinc-800/10">
          <Icon className="w-4 h-4 text-zinc-600" />
        </div>
        <p className="text-sm font-semibold text-zinc-900 truncate leading-tight">{group.name}</p>
      </div>
      <button
        type="button"
        onClick={() => onReview(group.cards)}
        className="w-full px-3 py-1.5 text-xs font-medium bg-zinc-800 text-amber-400 hover:text-amber-100 rounded-full transition-colors"
      >
        Przeglądaj
      </button>
    </article>
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
