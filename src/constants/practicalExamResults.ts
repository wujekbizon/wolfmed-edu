export const EXAM_RESULT_TABS = [
  { id: 'summary', label: 'Podsumowanie' },
  { id: 'procedures', label: 'Czynności' },
  { id: 'forms', label: 'Dokumentacja' },
]
export const EXAM_RESULT_QUESTIONS = [
  { id: 'score', prompt: 'Jak rozumieć mój wynik?' },
  { id: 'lost', prompt: 'Gdzie straciłem punkty?' },
  { id: 'compare', prompt: 'Jak czytać porównanie odpowiedzi?' },
]
export const EXAM_RESULT_SCORE_STYLES = {
  full: { label: 'Pełne punkty', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  partial: { label: 'Częściowe punkty', className: 'border-amber-200 bg-amber-50 text-amber-800' },
  none: { label: 'Bez punktów', className: 'border-rose-200 bg-rose-50 text-rose-800' },
  unscored: { label: 'Nie oceniano', className: 'border-zinc-200 bg-zinc-50 text-zinc-600' },
}
