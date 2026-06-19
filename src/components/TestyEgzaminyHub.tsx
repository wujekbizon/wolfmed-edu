import Link from 'next/link'
import { ArrowRight, ClipboardList, Stethoscope } from 'lucide-react'

const CARDS = [
  {
    href: '/panel/testy',
    title: 'Egzamin teoretyczny',
    subtitle: 'Część pisemna',
    description:
      'Testy jednokrotnego wyboru z kluczem odpowiedzi. Ćwicz pytania z poszczególnych kategorii i sprawdzaj swoją wiedzę przed egzaminem zawodowym.',
    features: ['Pytania jednokrotnego wyboru', 'Kategorie tematyczne', 'Pomiar czasu', 'Wynik końcowy'],
    icon: ClipboardList,
  },
  {
    href: '/panel/egzaminy',
    title: 'Egzamin praktyczny',
    subtitle: 'Część praktyczna',
    description:
      'Wierne arkusze egzaminacyjne MED.14 z prawdziwych sesji. Wypełnij dokumentację jak na egzaminie i otrzymaj ocenę zgodną z zasadami oceniania.',
    features: ['Arkusze z prawdziwych sesji', 'Wypełnianie kart', 'Ocena wg klucza', 'Próg zaliczenia 75%'],
    icon: Stethoscope,
  },
]

export default function TestyEgzaminyHub() {
  return (
    <section className="flex flex-col justify-center items-center w-full h-full px-1 sm:px-4 py-8">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        <div className="px-2">
          <h1 className="text-2xl font-bold text-zinc-800">Testy i egzaminy</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Wybierz rodzaj egzaminu, który chcesz ćwiczyć
          </p>
        </div>

        <div className="grid gap-6 px-2 grid-cols-1 md:grid-cols-2">
          {CARDS.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-center gap-4 p-6 border-b border-zinc-100 bg-zinc-50">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-700 text-white shrink-0">
                    <Icon className="w-6 h-6" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                      {card.subtitle}
                    </p>
                    <h2 className="text-xl font-bold text-zinc-800 leading-tight">{card.title}</h2>
                  </div>
                </div>

                <div className="flex flex-col grow p-6 gap-5">
                  <p className="text-zinc-600 text-sm leading-relaxed">{card.description}</p>

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

                  <div className="mt-auto pt-1">
                    <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 group-hover:bg-zinc-900 text-white text-sm font-medium rounded-xl transition-all duration-200">
                      Przejdź
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
