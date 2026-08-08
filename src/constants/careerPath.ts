import type { CareerPath } from '@/types/pathStoryTypes'

export const OPIEKUN_MEDYCZNY_PATH: CareerPath = {
  headline: 'Od pierwszego semestru do pracy przy pacjencie',
  steps: [
    {
      step: 'Krok 1',
      duration: '1 semestr',
      title: 'Podstawy opieki',
      description:
        'Anatomia, pierwsza pomoc, zasady higieny i komunikacja z pacjentem. Fundament, na którym stoi cała reszta.',
      photoHint: 'zajęcia praktyczne w pracowni',
    },
    {
      step: 'Krok 2',
      duration: '2–3 semestr',
      title: '31 procedur krok po kroku',
      description:
        'Algorytmy czynności opiekuńczych i higienicznych — od zmiany pozycji po pomiar parametrów. Uczysz się ich w takiej formie, w jakiej sprawdza je egzamin.',
      photoHint: 'ćwiczenie procedury na fantomie',
    },
    {
      step: 'Krok 3',
      duration: 'koniec nauki',
      title: 'Egzamin MED.14',
      description:
        'Część pisemna i praktyczna. Przed nim: testy próbne z całej puli pytań i szczegółowe wyniki każdego podejścia.',
      photoHint: 'zrzut: platforma — egzamin próbny',
    },
    {
      step: 'Krok 4',
      duration: 'po dyplomie',
      title: 'Praca przy pacjencie',
      description:
        'Szpital, dom pomocy społecznej, opieka domowa, hospicjum. Zawód z jednym z najniższych wskaźników bezrobocia w ochronie zdrowia.',
      photoHint: 'opiekun w domu pacjenta',
    },
  ],
}
