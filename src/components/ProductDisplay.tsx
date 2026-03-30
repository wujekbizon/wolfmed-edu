import Link from 'next/link'
import ProductCard from './ProductCard'
import { products } from '@/constants/products'

export default function ProductDisplay() {
  return (
    <div className="w-full max-w-6xl">
    

      <div className="mb-6 sm:mb-10 px-4 animate-[scaleIn_0.5s_ease-out_forwards] opacity-0" style={{ '--slidein-delay': '0.3s' } as React.CSSProperties}>
        <div className="max-w-md mx-auto">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4">
        <h2 className="text-lg sm:text-xl text-zinc-900 mb-8 text-center">Najczęściej zadawane pytania</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white backdrop-blur-sm rounded-lg border border-zinc-200/60 p-5">
            <h3 className="font-semibold text-zinc-900 mb-2 text-sm sm:text-base">Czy to subskrypcja?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Nie, to jednorazowa płatność. Brak miesięcznych opłat i automatycznych odnowień.
            </p>
          </div>
          <div className="bg-white backdrop-blur-sm rounded-lg border border-zinc-200/60 p-5">
            <h3 className="font-semibold text-zinc-900 mb-2 text-sm sm:text-base">Jak długo mam dostęp?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Bezterminowo - płacisz raz, korzystasz zawsze z funkcji premium.
            </p>
          </div>
          <div className="bg-white backdrop-blur-sm rounded-lg border border-zinc-200/60 p-5">
            <h3 className="font-semibold text-zinc-900 mb-2 text-sm sm:text-base">Jakie metody płatności akceptujecie?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Stripe - karty płatnicze, BLIK, przelewy bankowe.
            </p>
          </div>
          <div className="bg-white backdrop-blur-sm rounded-lg border border-zinc-200/60 p-5">
            <h3 className="font-semibold text-zinc-900 mb-2 text-sm sm:text-base">Czy moje dane są bezpieczne?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Tak, używamy Stripe z certyfikatem PCI DSS Level 1 - najwyższym standardem bezpieczeństwa.
            </p>
          </div>
        </div>
      </div>

      <Link className="block w-full mt-6 text-center px-4" href="/">
        <p className="text-xs xs:text-sm sm:text-base text-zinc-600 hover:text-zinc-800 transition-colors">
          Powrót do strony głównej
        </p>
      </Link>
    </div>
  )
}
