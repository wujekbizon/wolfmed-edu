export interface CourseProcedureCard {
  slug: string
  title: string
  subtitle: string
  description: string
  href: string
  image: string
  learningTime: string
  features: string[]
}

export const COURSE_PROCEDURE_CARDS: CourseProcedureCard[] = [
  {
    slug: 'opiekun-medyczny',
    title: 'Opiekun Medyczny',
    subtitle: 'Procedury i algorytmy',
    description:
      'Pełna lista procedur medycznych z algorytmami krok po kroku. Ucz się, ćwicz wyzwania i zdobywaj odznaki za opanowanie każdej procedury.',
    href: '/panel/procedury/opiekun-medyczny',
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5g1iJE1dK1JZolbvwfgWCAFPh8xz9BIKNsVjG',
    learningTime: '~60 godz.',
    features: ['Algorytmy krok po kroku', '5 typów wyzwań', 'System odznak', 'Śledzenie postępu'],
  },
  {
    slug: 'pielegniarstwo',
    title: 'Pielęgniarstwo',
    subtitle: 'Podstawy pielęgniarstwa',
    description:
      'Arkusze egzaminacyjne z podstaw pielęgniarstwa. Każda procedura zawiera sekcje, kroki i punktację zgodną z wymogami egzaminacyjnymi.',
    href: '/panel/procedury/pielegniarstwo',
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5MOj32FNpIgLRq2SWA1u9QmzbxiHJl47OaTGX',
    learningTime: '~45 godz.',
    features: ['Arkusze egzaminacyjne', 'System punktacji', 'Sekcje tematyczne', 'Uwagi do procedur'],
  },
]
