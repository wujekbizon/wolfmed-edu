import { Product } from '@/types/productsTypes'
import Image from 'next/image'
import SubmitButton from './SubmitButton'
import { createCheckoutSession } from '@/actions/stripe'

export default function ProductCard({ product }: { product: Product }) {
  const isPremium = product.id === 'premium'

  return (
    <div
      className={`relative rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col transition-all duration-300 hover:shadow-2xl ${
        isPremium ? 'bg-gradient-to-br from-white/80 to-rose-50/30 backdrop-blur-sm border border-[#ff9898]/30' : 'bg-white border border-zinc-200/60'
      }`}
    >
      {isPremium && (
        <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white text-xs font-semibold px-4 py-1 rounded-full">
          PREMIUM
        </div>
      )}

      <div className="flex items-center justify-center mb-6">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 border shadow-lg rounded-full overflow-hidden ${
            isPremium ? 'bg-gradient-to-br from-[#ff9898]/20 to-[#ffc5c5]/20 border-[#ff9898]/40' : 'bg-zinc-200 border-zinc-800/25 shadow-zinc-400'
          }`}
        >
          <Image
            src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
            alt="blood icon"
            width={80}
            height={80}
            priority
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <h2
        className={`text-xl sm:text-2xl font-bold text-center mb-3 ${
          isPremium ? 'text-zinc-900' : 'text-zinc-900'
        }`}
      >
        {product.name}
      </h2>

      <div className="text-center mb-6 pb-6 border-b border-zinc-200/60">
        <div className="mb-3">
          <span className="text-sm text-zinc-500 line-through">159,99 zł</span>
          <span className="ml-2 text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded">-69%</span>
        </div>
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <span className="text-5xl font-bold text-zinc-900">{product.price.toFixed(2)}</span>
          <span className="text-2xl text-zinc-600">zł</span>
        </div>
        <p className="text-sm text-zinc-500">Jednorazowa wpłata · Oferta limitowana</p>
      </div>

      <p
        className={`text-sm sm:text-base text-center mb-6 leading-relaxed ${
          isPremium ? 'text-zinc-700' : 'text-zinc-600'
        }`}
      >
        {product.description}
      </p>

      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#ff9898] to-[#ffc5c5] flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-zinc-700">Materiały i zasoby - 20MB miejsca na dysku</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#ff9898] to-[#ffc5c5] flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-zinc-700">Moje Notatki - twórz notatki z nauki</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#ff9898] to-[#ffc5c5] flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-zinc-700">Dostęp do modułu praktycznego i tablicy</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#ff9898] to-[#ffc5c5] flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-zinc-700">Wyzwania i quizy procedur - zdobywaj odznaki</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#ff9898] to-[#ffc5c5] flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-zinc-700">Wsparcie rozwoju platformy</span>
        </div>
      </div>

      <form action={createCheckoutSession} className="mt-auto">
        <input type="hidden" name="productId" value={product.id} />
        <SubmitButton label="Wspieram - 49,99 zł" loading="Przetwarzanie..." />
      </form>
    </div>
  )
}
