export interface CourseProcedureCard {
  slug: string
  title: string
  subtitle: string
  description: string
  href: string
  accentColor: string
}

export const COURSE_PROCEDURE_CARDS: CourseProcedureCard[] = [
  {
    slug: 'opiekun-medyczny',
    title: 'Opiekun Medyczny',
    subtitle: 'Procedury i algorytmy',
    description:
      'Pełna lista procedur medycznych z algorytmami krok po kroku. Ucz się, ćwicz wyzwania i zdobywaj odznaki za opanowanie każdej procedury.',
    href: '/panel/procedury/opiekun-medyczny',
    accentColor: 'border-zinc-400/60',
  },
  {
    slug: 'pielegniarstwo',
    title: 'Pielęgniarstwo',
    subtitle: 'Podstawy pielęgniarstwa',
    description:
      'Arkusze egzaminacyjne z podstaw pielęgniarstwa. Każda procedura zawiera sekcje, kroki i punktację zgodną z wymogami egzaminacyjnymi.',
    href: '/panel/procedury/pielegniarstwo',
    accentColor: 'border-zinc-400/60',
  },
]
