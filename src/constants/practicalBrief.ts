export const PRACTICAL_BRIEF_TABS = [
  { id: 'task', label: 'Zadanie' },
  { id: 'patient', label: 'Pacjent' },
  { id: 'scope', label: 'Zakres egzaminu' },
] as const

export const PRACTICAL_BRIEF_QUESTIONS = [
  { id: 'task', label: 'Co mam zrobić w tym arkuszu?', tab: 'task' },
  { id: 'documents', label: 'Jak wypełniać dokumentację?', tab: 'scope' },
  { id: 'grading', label: 'Jak oceniany jest egzamin?', tab: 'scope' },
  { id: 'timer', label: 'Kiedy zaczyna się odliczanie?', tab: 'task' },
] as const
