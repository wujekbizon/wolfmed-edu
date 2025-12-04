import Link from 'next/link'
import ProductCard from './ProductCard'
import { products } from '@/constants/products'
import { Check, X, Heart, Beaker, Sparkles } from 'lucide-react'

export default function ProductDisplay() {
  return (
    <div className="w-full max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16 px-4 animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0" style={{ '--slidein-delay': '0.1s' } as React.CSSProperties}>
        <span className="inline-block rounded-full bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white px-4 py-2 text-sm font-semibold border border-[#ff9898]/40 mb-4 shadow-md">
          ⏰ Oferta Limitowana
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
          Wspieraj Wolfmed Premium
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 max-w-3xl mx-auto mb-4">
          Jednorazowa wpłata 49,99 zł wspiera rozwój platformy i odblokowuje wszystkie funkcje premium dla Opiekuna Medycznego
        </p>
        <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-8">
          <p className="text-sm sm:text-base text-amber-900 font-medium">
            Ta oferta jest dostępna tylko przez ograniczony czas dla osób, które chcą wesprzeć nasz projekt.
            <span className="block mt-1 text-amber-700">
              Regularna cena: <span className="line-through">159,99 zł</span> · Dziś: <span className="font-bold text-[#ff9898]">49,99 zł</span>
            </span>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ff9898]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>500+ użytkowników</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ff9898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Bezpieczne płatności Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ff9898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>Jednorazowa płatność</span>
          </div>
        </div>
      </div>

      {/* Premium Card */}
      <div className="mb-16 sm:mb-20 px-4 animate-[scaleIn_0.5s_ease-out_forwards] opacity-0" style={{ '--slidein-delay': '0.3s' } as React.CSSProperties}>
        <div className="max-w-md mx-auto">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Comparison Section */}
      <div className="mb-16 sm:mb-20 px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Co zyskujesz z Premium?</h2>
          <p className="text-zinc-600">Porównanie funkcji dostępnych w wersjach darmowej i premium</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-zinc-50/80 backdrop-blur-sm rounded-xl border border-zinc-200/60 p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-6 text-center">Plan Darmowy</h3>
            <p className="text-2xl font-bold text-zinc-700 mb-6 text-center">0 zł</p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700">Bazy testów z 2 ostatnich lat z egzaminów i kursu</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700">Procedury Opiekuna Medycznego</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700">Przegląd postępów i wyników testów</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700">Testy praktyczne i egzamin próbny</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700">Forum i blog medyczny</span>
              </li>
              <li className="flex items-start gap-3 opacity-40">
                <X className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-500">Materiały i zasoby (20MB)</span>
              </li>
              <li className="flex items-start gap-3 opacity-40">
                <X className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-500">Moje Notatki</span>
              </li>
              <li className="flex items-start gap-3 opacity-40">
                <X className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-500">Moduł praktyczny i tablica</span>
              </li>
              <li className="flex items-start gap-3 opacity-40">
                <X className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-500">Wyzwania i quizy - odznaki</span>
              </li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-white/80 to-rose-50/30 backdrop-blur-sm rounded-xl border border-[#ff9898]/30 p-6 sm:p-8 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white text-xs font-semibold px-4 py-1 rounded-full">
              POLECANE
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-6 text-center">Plan Premium</h3>
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-zinc-900">49,99 zł</p>
              <p className="text-sm text-zinc-500 mt-1">Jednorazowa wpłata</p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700 font-medium">Wszystko z planu darmowego</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700">Materiały i zasoby - 20MB miejsca na dysku</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700">Moje Notatki - twórz notatki z nauki</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700">Dostęp do modułu praktycznego i tablicy</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#ff9898] flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700">Wyzwania i quizy procedur - zdobywaj odznaki</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-white/60 via-zinc-50/80 to-rose-50/30 border-y border-zinc-200/60 py-16 sm:py-20 px-4 -mx-3 sm:-mx-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Benefit 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-zinc-200/60 p-6 hover:shadow-lg hover:border-[#ff9898]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ff9898]/10 to-[#ffc5c5]/10 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#ff9898]" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Wspieraj Rozwój</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Twoja jednorazowa wpłata bezpośrednio finansuje rozwój nowych funkcji i utrzymanie platformy dla społeczności medycznej
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-zinc-200/60 p-6 hover:shadow-lg hover:border-[#ff9898]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ff9898]/10 to-[#ffc5c5]/10 flex items-center justify-center mb-4">
                <Beaker className="w-6 h-6 text-[#ff9898]" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Zaawansowane Narzędzia</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Pełny dostęp do modułu praktycznego, notatek, wyzwań i quizów procedur przygotowanych przez specjalistów
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-zinc-200/60 p-6 hover:shadow-lg hover:border-[#ff9898]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ff9898]/10 to-[#ffc5c5]/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#ff9898]" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Dożywotni Dostęp</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Płacisz raz, korzystasz zawsze - brak miesięcznych opłat i ukrytych kosztów
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto py-16 sm:py-20 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-8 text-center">Najczęściej zadawane pytania</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-zinc-200/60 p-5">
            <h3 className="font-semibold text-zinc-900 mb-2 text-sm sm:text-base">Czy to subskrypcja?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Nie, to jednorazowa płatność. Brak miesięcznych opłat i automatycznych odnowień.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-zinc-200/60 p-5">
            <h3 className="font-semibold text-zinc-900 mb-2 text-sm sm:text-base">Jak długo mam dostęp?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Bezterminowo - płacisz raz, korzystasz zawsze z funkcji premium.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-zinc-200/60 p-5">
            <h3 className="font-semibold text-zinc-900 mb-2 text-sm sm:text-base">Jakie metody płatności akceptujecie?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Stripe - karty płatnicze, BLIK, przelewy bankowe.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-zinc-200/60 p-5">
            <h3 className="font-semibold text-zinc-900 mb-2 text-sm sm:text-base">Czy moje dane są bezpieczne?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Tak, używamy Stripe z certyfikatem PCI DSS Level 1 - najwyższym standardem bezpieczeństwa.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <Link className="block w-full mt-6 text-center px-4" href="/">
        <p className="text-xs xs:text-sm sm:text-base text-zinc-600 hover:text-zinc-800 transition-colors">
          Powrót do strony głównej
        </p>
      </Link>
    </div>
  )
}
