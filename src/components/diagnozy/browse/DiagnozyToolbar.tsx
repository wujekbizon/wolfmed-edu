'use client'

import { Search, X } from 'lucide-react'
import { DIAGNOZY_SORT_KEYS } from '@/types/diagnozyTypes'
import type {
  DiagnozyBrowseCriteria,
  DiagnozyChapterOption,
  DiagnozySortKey,
  DiagnozyStatusFilter,
} from '@/types/diagnozyTypes'

const SORT_LABELS: Record<DiagnozySortKey, string> = {
  'section-asc': 'Numer sekcji ↑',
  'section-desc': 'Numer sekcji ↓',
  'title-asc': 'Tytuł A–Z',
  'title-desc': 'Tytuł Z–A',
  'todo-first': 'Nieukończone najpierw',
}

const STATUS_LABELS: Record<DiagnozyStatusFilter, string> = {
  all: 'Wszystkie',
  todo: 'Nieukończone',
  done: 'Ukończone',
}

const selectClass =
  'h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-700 ' +
  'cursor-pointer focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100'

export default function DiagnozyToolbar({
  criteria,
  chapters,
  onChange,
}: {
  criteria: DiagnozyBrowseCriteria
  chapters: DiagnozyChapterOption[]
  onChange: (patch: Partial<DiagnozyBrowseCriteria>) => void
}) {
  return (
    <div className="sticky top-0 z-20 -mx-1 px-1 py-3 bg-zinc-50/90 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[12rem]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={criteria.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Szukaj diagnozy, sekcji, autora…"
          aria-label="Szukaj diagnoz"
          className="w-full h-10 rounded-xl border border-zinc-300 bg-white pl-9 pr-9 text-sm text-zinc-700
            focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
        {criteria.search && (
          <button
            type="button"
            onClick={() => onChange({ search: '' })}
            aria-label="Wyczyść"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <select
        value={criteria.chapter}
        onChange={(e) => onChange({ chapter: e.target.value })}
        aria-label="Filtruj po rozdziale"
        className={selectClass}
      >
        <option value="">Wszystkie rozdziały</option>
        {chapters.map((c) => (
          <option key={c.number} value={c.number}>
            {c.number}. {c.title || `Rozdział ${c.number}`}
          </option>
        ))}
      </select>

      <select
        value={criteria.status}
        onChange={(e) => onChange({ status: e.target.value as DiagnozyStatusFilter })}
        aria-label="Filtruj po statusie"
        className={selectClass}
      >
        {(Object.keys(STATUS_LABELS) as DiagnozyStatusFilter[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={criteria.sort}
        onChange={(e) => onChange({ sort: e.target.value as DiagnozySortKey })}
        aria-label="Sortuj"
        className={selectClass}
      >
        {DIAGNOZY_SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
    </div>
  )
}
