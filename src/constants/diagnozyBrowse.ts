import type { DiagnozySortKey, DiagnozyStatusFilter } from '@/types/diagnozyTypes'

export const DIAGNOZY_SORT_LABELS: Record<DiagnozySortKey, string> = {
  'section-asc': 'Numer sekcji ↑',
  'section-desc': 'Numer sekcji ↓',
  'title-asc': 'Tytuł A–Z',
  'title-desc': 'Tytuł Z–A',
  'todo-first': 'Nieukończone najpierw',
}

export const DIAGNOZY_STATUS_LABELS: Record<DiagnozyStatusFilter, string> = {
  all: 'Wszystkie',
  todo: 'Nieukończone',
  done: 'Ukończone',
}

export const DIAGNOZY_ALL_CHAPTERS_LABEL = 'Wszystkie rozdziały'
