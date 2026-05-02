import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import { COURSE_PROCEDURE_CARDS } from '@/constants/courseProcedureCards'

interface Props {
  hasOpiekun: boolean
  hasPielegniarstwo: boolean
  procedureCounts: Record<string, number>
}

export default function ProceduresHub({ hasOpiekun, hasPielegniarstwo, procedureCounts }: Props) {
  const availableCards = COURSE_PROCEDURE_CARDS.filter((card) => {
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
            availableCards.length === 1 ? 'grid-cols-1 max-w-lg' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {availableCards.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className="group flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Hero image */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
                    {card.subtitle}
                  </p>
                  <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-sm">
                    {card.title}
                  </h2>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col grow p-5 gap-4">
                <p className="text-zinc-600 text-sm leading-relaxed">{card.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                    <BookOpen className="w-3.5 h-3.5" />
                    {procedureCounts[card.slug] ?? 0} procedur
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {card.learningTime}
                  </span>
                </div>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2">
                  {card.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-auto pt-2">
                  <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 group-hover:bg-zinc-900 text-white text-sm font-medium rounded-xl transition-all duration-200">
                    Przejdź do procedur
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
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
