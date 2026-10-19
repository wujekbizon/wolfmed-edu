import type { NaukaWolfekQuestion } from '@/types/naukaLayoutTypes'

export const NAUKA_WOLFEK_QUESTIONS: readonly NaukaWolfekQuestion[] = [
  {
    id: 'categories',
    prompt: 'Co znajdę w Kategorie?',
    text: 'Tu znajdziesz kategorie pytań z Twoich kursów i własne kategorie testów. Wyszukaj temat lub wybierz kurs, a potem kliknij kategorię, żeby rozpocząć naukę.',
    actionLabel: 'Otwórz Kategorie',
  },
  {
    id: 'workspace',
    prompt: 'Jak korzystać z Pracowni AI?',
    text: 'To Twoje miejsce do pracy: dodawaj notatki, tablice, fiszki i mapy myśli. Asystent AI pomoże Ci z pytaniami i materiałami, a testy pozwolą sprawdzić wiedzę. Narzędzia AI wymagają konta Premium. Zapisuj pracę przyciskiem zapisu, żeby móc do niej wrócić.',
    actionLabel: 'Otwórz Pracownię AI',
  },
  {
    id: 'library',
    prompt: 'Co znajdę w Bibliotece?',
    text: 'Biblioteka zbiera Twoje notatki, fiszki i dodane materiały. Przełączaj zakładki, żeby szybko znaleźć to, czego potrzebujesz. Z Premium masz tu również swoje wygenerowane wykłady audio.',
    actionLabel: 'Otwórz Bibliotekę',
  },
]
