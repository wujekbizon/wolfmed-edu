import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CourseCard {
  slug: string
  title: string
  subtitle: string
  description: string
  procedureCount: number
  href: string
  accentColor: string
}

const COURSE_CARDS: CourseCard[] = [
  {
    slug: 'opiekun-medyczny',
    title: 'Opiekun Medyczny',
    subtitle: 'Procedury i algorytmy',
    description:
      'Pełna lista procedur medycznych z algorytmami krok po kroku. Ucz się, ćwicz wyzwania i zdobywaj odznaki za opanowanie każdej procedury.',
    procedureCount: 103,
    href: '/panel/procedury/opiekun-medyczny',
    accentColor: 'border-zinc-400/60',
  },
  {
    slug: 'pielegniarstwo',
    title: 'Pielęgniarstwo',
    subtitle: 'Podstawy pielęgniarstwa',
    description:
      'Arkusze egzaminacyjne z podstaw pielęgniarstwa. Każda procedura zawiera sekcje, kroki i punktację zgodną z wymogami egzaminacyjnymi.',
    procedureCount: 103,
    href: '/panel/procedury/pielegniarstwo',
    accentColor: 'border-zinc-400/60',
  },
]

interface Props {
  hasOpiekun: boolean
  hasPielegniarstwo: boolean
}

export default function ProceduresHub({ hasOpiekun, hasPielegniarstwo }: Props) {
  const availableCards = COURSE_CARDS.filter((card) => {
    if (card.slug === 'opiekun-medyczny') return hasOpiekun
    if (card.slug === 'pielegniarstwo') return hasPielegniarstwo
    return false
  })

  return (
    <section className="flex flex-col items-center gap-8 px-1 sm:px-4 py-4 w-full h-full">
      <div className="w-full max-w-5xl">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-bold text-zinc-800">Procedury medyczne</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Wybierz kurs, aby przeglądać procedury i ćwiczenia
          </p>
        </div>

        {availableCards.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <p className="text-zinc-400 text-base">
              Brak dostępu do procedur. Zakup kurs, aby odblokować tę sekcję.
            </p>
          </div>
        )}

        <div
          className={`grid gap-6 px-2 ${
            availableCards.length === 1
              ? 'grid-cols-1 max-w-md'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {availableCards.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className={`group relative border ${card.accentColor} bg-white flex flex-col p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}
            >
              <div className="flex flex-col grow gap-3">
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
                    {card.subtitle}
                  </p>
                  <h2 className="text-xl font-bold text-zinc-800 leading-tight">{card.title}</h2>
                </div>

                <p className="text-zinc-600 text-sm leading-relaxed grow">{card.description}</p>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-zinc-400 font-medium">
                    {card.procedureCount} procedur
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 group-hover:text-zinc-900 bg-zinc-100 group-hover:bg-zinc-200 rounded-full transition-all group-hover:gap-2">
                    Przejdź do procedur
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
