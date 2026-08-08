import type { PathQuestions } from '@/types/pathStoryTypes'

export const PIELEGNIARSTWO_QUESTIONS: PathQuestions = {
  eyebrow: 'Kierunek Edukacyjny',
  lead: 'Prowadzimy Cię przez trzy lata studiów pielęgniarskich — przedmioty podstawowe i kierunkowe, proces pielęgnowania i testy sprawdzające, na jednej platformie. Zobacz, czego uczymy i do jakiej pracy Cię przygotowujemy.',
  cta: 'Zobacz szczegółowy program',
  items: [
    {
      question: 'Czym zajmuje się pielęgniarka?',
      answer:
        'Prowadzi proces pielęgnowania: ocenia stan pacjenta, planuje opiekę, podaje leki, wykonuje zabiegi i uczy pacjenta oraz rodzinę życia z chorobą.'
    },
    {
      question: 'Jak długo trwa nauka?',
      answer:
        '3 lata studiów licencjackich — 2260 godzin zajęć i 63 punkty ECTS. Dalej opcjonalnie 2 lata magisterskich.'
    },
    {
      question: 'Jaki egzamin kończy studia?',
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
