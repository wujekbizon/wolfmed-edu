import type { Diagnoza, WypelnijStepConfig } from '@/types/diagnozyTypes'

// Builds the fill-out steps mirroring the Przewodnik rows:
// Diagnoza pielęgniarska | Cel | Planowane interwencje | Ocena.
// Every option is a correct, book-sourced answer — selecting it writes it
// into the form; there are no distractors and no grading.
export function buildWypelnijSteps(diagnoza: Diagnoza): WypelnijStepConfig[] {
  return [
    {
      key: 'diagnoza',
      title: 'Diagnoza pielęgniarska',
      prompt: 'Postaw diagnozę pielęgniarską dla opisanego przypadku.',
      multi: false,
      options: [{ text: diagnoza.diagnozaPielegniarska }],
    },
    {
      key: 'cele',
      title: 'Cel',
      prompt: 'Zaplanuj cele opieki — zaznacz każdy z nich.',
      multi: true,
      options: diagnoza.celeOpieki.map((cel) => ({ text: cel })),
    },
    {
      key: 'interwencje',
      title: 'Planowane interwencje',
      prompt:
        'Zaplanuj interwencje pielęgniarskie — każda zaznaczona interwencja odsłania swoje uzasadnienie.',
      multi: true,
      options: diagnoza.interwencje.map((interwencja) => ({
        text: interwencja.interwencja,
        detail: interwencja.uzasadnienie,
      })),
    },
    {
      key: 'ocena',
      title: 'Ocena',
      prompt: 'Wybierz oczekiwany wynik opieki.',
      multi: false,
      options: [{ text: diagnoza.oczekiwaneWyniki }],
    },
  ]
}
