import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  LayoutGrid,
  HelpCircle,
  FileText,
  CheckCircle2,
  BookOpenCheck,
  Timer,
  BarChart3,
  ClipboardList,
  Target,
  CalendarDays,
} from 'lucide-react'
import { pluralizePl } from '@/helpers/pluralizePl'

interface Props {
  categoryCount: number
  questionCount: number
  categoryNames: string[]
  practicalExamCount: number
  sessionNames: string[]
  hasPracticalAccess: boolean
}

interface Stat {
  icon: ReactNode
  value: string
  label: string
}

interface CardConfig {
  href: string
  title: string
  subtitle: string
  description: string
  image: string
  badge?: string
  stats: Stat[]
  preview?: { icon: ReactNode; label: string; items: string[]; limit: number }
  meta: { icon: ReactNode; label: string }[]
  cta: string
}

const THEORY_IMAGE = 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5T8A3NV6spcKHld4CGX8o0kyJTPUwfnQEMegN'
const PRACTICE_IMAGE = 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k55tagqNnBKUAhkYmyprxV4JznuWGliEwXqgb2'

export default function TestyEgzaminyHub({
  categoryCount,
  questionCount,
  categoryNames,
  practicalExamCount,
  sessionNames,
  hasPracticalAccess,
}: Props) {
  const theoryCard: CardConfig = {
    href: '/panel/testy',
    title: 'Egzamin teoretyczny',
    subtitle: 'Część pisemna',
    description:
      'Testy jednokrotnego wyboru z kluczem odpowiedzi. Ćwicz pytania z dostępnych kategorii tematycznych, utrwalaj materiał i sprawdzaj swoją wiedzę w dowolnym momencie.',
    image: THEORY_IMAGE,
    stats: [
      {
        icon: <HelpCircle className="w-3.5 h-3.5" />,
        value: questionCount.toLocaleString('pl-PL'),
        label: pluralizePl(questionCount, ['pytanie', 'pytania', 'pytań']),
      },
      {
        icon: <LayoutGrid className="w-3.5 h-3.5" />,
        value: categoryCount.toLocaleString('pl-PL'),
        label: pluralizePl(categoryCount, ['kategoria', 'kategorie', 'kategorii']),
      },
    ],
    preview: {
      icon: <BookOpenCheck className="w-3.5 h-3.5" />,
      label: 'Kategorie w zestawie',
      items: categoryNames,
      limit: 5,
    },
    meta: [
      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Klucz odpowiedzi' },
      { icon: <Timer className="w-3.5 h-3.5" />, label: 'Pomiar czasu' },
      { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Wynik końcowy' },
    ],
    cta: 'Przejdź do testów',
  }

  const practiceCard: CardConfig = hasPracticalAccess
    ? {
        href: '/panel/egzaminy',
        title: 'Egzamin praktyczny',
        subtitle: 'Część praktyczna',
        description:
          'Wierne arkusze egzaminacyjne MED.14 z prawdziwych sesji. Wypełnij dokumentację jak na egzaminie i otrzymaj ocenę zgodną z zasadami oceniania.',
        image: PRACTICE_IMAGE,
        stats: [
          {
            icon: <FileText className="w-3.5 h-3.5" />,
            value: practicalExamCount.toLocaleString('pl-PL'),
            label: pluralizePl(practicalExamCount, ['arkusz', 'arkusze', 'arkuszy']),
          },
          {
            icon: <Target className="w-3.5 h-3.5" />,
            value: '75%',
            label: 'Próg zaliczenia',
          },
        ],
        preview: {
          icon: <CalendarDays className="w-3.5 h-3.5" />,
          label: 'Dostępne sesje',
          items: sessionNames,
          limit: 4,
        },
        meta: [
          { icon: <ClipboardList className="w-3.5 h-3.5" />, label: 'Wypełnianie kart' },
          { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Ocena wg klucza' },
          { icon: <FileText className="w-3.5 h-3.5" />, label: 'Prawdziwe sesje' },
        ],
        cta: 'Przejdź do egzaminów',
      }
    : {
        href: '/panel/egzaminy',
        title: 'Egzamin praktyczny',
        subtitle: 'Część praktyczna',
        description:
          'Praktyczne arkusze egzaminacyjne z prawdziwych sesji. Wypełnij dokumentację jak na egzaminie i otrzymaj ocenę zgodną z zasadami oceniania. Arkusze dla Twojego kierunku przygotowujemy — będą dostępne wkrótce.',
        image: PRACTICE_IMAGE,
        badge: 'Wkrótce',
        stats: [],
        meta: [
          { icon: <ClipboardList className="w-3.5 h-3.5" />, label: 'Wypełnianie kart' },
          { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Ocena wg klucza' },
          { icon: <FileText className="w-3.5 h-3.5" />, label: 'Prawdziwe sesje' },
        ],
        cta: 'Przejdź do egzaminów',
      }

  const cards = [theoryCard, practiceCard]

  return (
    <section className="flex flex-col justify-center items-center w-full h-full px-1 sm:px-4 py-8">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        <div className="px-2">
          <h1 className="text-2xl font-bold text-zinc-800">Testy i egzaminy</h1>
          <p className="text-zinc-500 text-sm mt-1">Wybierz rodzaj egzaminu, który chcesz ćwiczyć</p>
        </div>

        <div className="grid gap-6 px-2 grid-cols-1 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Accent hairline (borrowed from the media player) */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Hero image */}
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                {card.badge && (
                  <span className="absolute top-4 left-4 text-[11px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1">
                    {card.badge}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
                    {card.subtitle}
                  </p>
                  <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-sm">
                    {card.title}
                  </h2>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col grow p-6 gap-5">
                <p className="text-zinc-600 text-sm leading-relaxed">{card.description}</p>

                {/* Stat band */}
                {card.stats.length > 0 && (
                  <div className="flex rounded-xl border border-zinc-200 group-hover:border-fuchsia-200 bg-gradient-to-b from-white to-zinc-50 overflow-hidden transition-colors duration-300">
                    {card.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex-1 flex flex-col gap-2 px-4 py-3.5 border-l border-zinc-200 first:border-l-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff9898] to-fuchsia-400 text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
                            {stat.icon}
                          </span>
                          <span className="text-2xl font-bold text-zinc-800 tabular-nums leading-none">
                            {stat.value}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Content preview */}
                {card.preview && card.preview.items.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      <span className="text-fuchsia-400">{card.preview.icon}</span>
                      {card.preview.label}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {card.preview.items.slice(0, card.preview.limit).map((item) => (
                        <span
                          key={item}
                          className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200"
                        >
                          {item}
                        </span>
                      ))}
                      {card.preview.items.length > card.preview.limit && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white font-medium">
                          +{card.preview.items.length - card.preview.limit} więcej
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta line */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {card.meta.map((m) => (
                    <span key={m.label} className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                      <span className="text-zinc-400">{m.icon}</span>
                      {m.label}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-auto pt-1">
                  <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 group-hover:bg-zinc-900 text-white text-sm font-medium rounded-xl transition-all duration-200">
                    {card.cta}
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
