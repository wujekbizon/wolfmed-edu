import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface Props {
  categoryCount: number
  hasPracticalAccess: boolean
}

export default function TestyEgzaminyHub({ categoryCount, hasPracticalAccess }: Props) {
  const CARDS = [
    {
      href: '/panel/testy',
      title: 'Egzamin teoretyczny',
      subtitle: 'Część pisemna',
      description: `Testy jednokrotnego wyboru z kluczem odpowiedzi. Ćwicz pytania z ${categoryCount} kategorii tematycznych i sprawdzaj swoją wiedzę przed egzaminem zawodowym.`,
      image: 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5T8A3NV6spcKHld4CGX8o0kyJTPUwfnQEMegN',
      features: ['Pytania jednokrotnego wyboru', `${categoryCount} kategorii tematycznych`, 'Pomiar czasu', 'Wynik końcowy'],
    },
    hasPracticalAccess
      ? {
          href: '/panel/egzaminy',
          title: 'Egzamin praktyczny',
          subtitle: 'Część praktyczna',
          description:
            'Wierne arkusze egzaminacyjne MED.14 z prawdziwych sesji. Wypełnij dokumentację jak na egzaminie i otrzymaj ocenę zgodną z zasadami oceniania.',
          image: 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k55tagqNnBKUAhkYmyprxV4JznuWGliEwXqgb2',
          features: ['Arkusze z prawdziwych sesji', 'Wypełnianie kart', 'Ocena wg klucza', 'Próg zaliczenia 75%'],
        }
      : {
          href: '/panel/egzaminy',
          title: 'Egzamin praktyczny',
          subtitle: 'Część praktyczna',
          description:
            'Wierne arkusze egzaminacyjne z prawdziwych sesji egzaminacyjnych. Wypełnij dokumentację jak na egzaminie i otrzymaj ocenę zgodną z zasadami oceniania.',
          image: 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k55tagqNnBKUAhkYmyprxV4JznuWGliEwXqgb2',
          features: ['Arkusze z prawdziwych sesji', 'Wypełnianie kart', 'Ocena wg klucza', 'Wynik końcowy'],
        },
  ]

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
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Hero image */}
              <div className="relative h-72 w-full overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
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
                <div className="mt-auto pt-1">
                  <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 group-hover:bg-zinc-900 text-white text-sm font-medium rounded-xl transition-all duration-200">
                    Przejdź
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
