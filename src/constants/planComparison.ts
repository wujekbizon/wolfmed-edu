import type { ComparisonGroup } from '@/types/pricingTypes'

const LEARNING_ROWS: ComparisonGroup = {
  label: 'Nauka i materiały',
  rows: [
    { label: 'Moje Notatki', basic: true, premium: true },
    { label: 'Fiszki i decki powtórkowe', basic: true, premium: true },
    { label: 'Plan nauki z analizą postępów', basic: true, premium: true },
    { label: 'Wyzwania i quizy procedur', basic: true, premium: true },
    { label: 'Moduł praktyczny i tablica', basic: true, premium: true },
    { label: 'Materiały i zasoby', basic: '20 MB', premium: '20 MB' },
  ],
}

const COMMUNITY_ROWS: ComparisonGroup = {
  label: 'Społeczność i wsparcie',
  rows: [
    { label: 'Forum i Blog Medyczny', basic: true, premium: true },
    { label: 'Powiadomienia na forum', basic: true, premium: true },
    { label: 'Przegląd postępów i wyników', basic: true, premium: true },
  ],
}

const AI_ROWS: ComparisonGroup = {
  label: 'Asystent AI',
  rows: [
    { label: 'Asystent AI znający materiał kursu', basic: false, premium: true },
    { label: 'Automatyczne notatki i streszczenia', basic: false, premium: true },
    { label: 'Testy i quizy generowane przez AI', basic: false, premium: true },
    { label: 'Wykłady audio generowane przez AI', basic: false, premium: true },
    { label: 'Edytowalne diagramy i mapy myśli', basic: false, premium: true },
    { label: 'Biblioteka osobista — AI czyta Twoje notatki i pliki PDF', basic: false, premium: true },
  ],
}

export const PLAN_COMPARISON: Record<string, ComparisonGroup[]> = {
  'opiekun-medyczny': [
    {
      label: 'Baza pytań i testy',
      rows: [
        { label: 'Pytania egzaminacyjne', basic: 'ponad 900', premium: 'ponad 900' },
        { label: 'Testy praktyczne i Egzamin Próbny', basic: true, premium: true },
        { label: 'Procedury Opiekuna Medycznego', basic: true, premium: true },
        { label: 'Nowe treści dodawane automatycznie', basic: false, premium: true },
      ],
    },
    LEARNING_ROWS,
    COMMUNITY_ROWS,
    AI_ROWS,
  ],
  pielegniarstwo: [
    {
      label: 'Baza pytań i testy',
      rows: [
        { label: 'Pytania egzaminacyjne', basic: 'ponad 22 700', premium: 'ponad 22 700' },
        { label: 'Kategorie przedmiotowe', basic: '22', premium: '22' },
        { label: 'Testy praktyczne i egzaminy próbne', basic: true, premium: true },
        { label: 'Diagnozy i Interwencje', basic: false, premium: true },
        { label: 'Nowe semestry dodawane automatycznie', basic: false, premium: true },
      ],
    },
    LEARNING_ROWS,
    COMMUNITY_ROWS,
    AI_ROWS,
  ],
}
