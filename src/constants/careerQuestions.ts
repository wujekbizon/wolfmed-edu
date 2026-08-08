import type { PathQuestions } from '@/types/pathStoryTypes'

export const PIELEGNIARSTWO_QUESTIONS: PathQuestions = {
  eyebrow: 'Zanim wybierzesz',
  title: 'Kim jest pielęgniarka',
  accent: '?',
  lead: 'Trzy pytania, które padają najczęściej — zanim pokażemy Ci program nauczania.',
  cta: 'Zobacz szczegółowy program',
  items: [
    {
      question: 'Co robi na co dzień?',
      answer:
        'Prowadzi proces pielęgnowania: ocenia stan pacjenta, planuje opiekę, podaje leki, wykonuje zabiegi i uczy pacjenta oraz rodzinę życia z chorobą.'
    },
    {
      question: 'Jak długo trwa nauka?',
      answer:
        '3 lata studiów licencjackich — 2260 godzin zajęć i 63 punkty ECTS. Dalej opcjonalnie 2 lata magisterskich.'
    },
    {
      question: 'Jaki egzamin kończy naukę?',
      answer:
        'Egzamin dyplomowy — teoria i praktyka. Przygotowuje do niego baza 22 700 pytań z 22 kategorii.'
    }
  ],
  shots: [
    { photoHint: 'pielęgniarka przy łóżku pacjenta' },
    { photoHint: 'przygotowanie leków' },
    { photoHint: 'zrzut: platforma — test próbny' },
    { photoHint: 'zespół na dyżurce' }
  ]
}
