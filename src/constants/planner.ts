import type { PaceStatus } from '@/types/plannerTypes'

export const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Pn' },
  { value: 2, label: 'Wt' },
  { value: 3, label: 'Śr' },
  { value: 4, label: 'Cz' },
  { value: 5, label: 'Pt' },
  { value: 6, label: 'So' },
  { value: 7, label: 'Nd' },
]

export const PACE_CONFIG: Record<PaceStatus, { label: string; className: string }> = {
  ahead: { label: 'Przed planem', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_track: { label: 'Zgodnie z planem', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  behind: { label: 'Za planem', className: 'bg-amber-50 text-amber-700 border-amber-200' },
}

export const PLAN_INPUT_CLASS =
  'w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9898]/50 focus:border-transparent transition-shadow'

export const MAX_CONCEPTS = 60
export const TOPIC_DEFAULT_MINUTES = 30
export const CONCEPT_DEFAULT_MINUTES = 60
export const MIN_MINUTES_PER_DAY = 15
export const MAX_MINUTES_PER_DAY = 240
