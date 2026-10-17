import type { LearningCardFilter, LearningCardFiltersProps } from '@/types/learningUiTypes'

const FILTERS: Array<{ id: LearningCardFilter; label: string }> = [
  { id: 'all', label: 'Wszystkie' }, { id: 'new', label: 'Nowe' },
  { id: 'review', label: 'Do powtórki' }, { id: 'mastered', label: 'Opanowane' },
]
export default function LearningCardFilters({ value, counts, onChange }: LearningCardFiltersProps) {
  return <div className="learning-card-filters" role="group" aria-label="Filtruj karty">
    {FILTERS.map((filter) => <button key={filter.id} type="button"
      aria-pressed={value === filter.id} onClick={() => onChange(filter.id)}>
      <span>{filter.label}</span><span className="learning-filter-count">{counts[filter.id].toLocaleString('pl-PL')}</span>
    </button>)}
  </div>
}
