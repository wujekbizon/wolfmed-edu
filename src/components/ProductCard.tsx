import { Product } from '@/types/productsTypes'
import Image from 'next/image'
import SubmitButton from './SubmitButton'
import { createCheckoutSession } from '@/actions/stripe'

export default function ProductCard({ product }: { product: Product }) {
  const isPremium = product.id === 'premium'

  return (
    <div
      className={`rounded-lg shadow-md p-2 xs:p-3 sm:p-4 md:p-6 flex flex-col ${
        isPremium ? 'bg-gradient-to-br from-amber-50 to-amber-200 border border-yellow-400' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-center mb-2 xs:mb-3 sm:mb-4">
        <div
          className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 border shadow rounded-full overflow-hidden ${
            isPremium ? 'bg-amber-300/40 border-yellow-500' : 'bg-zinc-200 border-zinc-800/25 shadow-zinc-400'
          }`}
        >
          <Image
            src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
            alt="blood icon"
            width={64}
            height={64}
            priority
            className="h-full w-full object-contain"
          />
        </div>
      </div>
      <h2
        className={`text-lg xs:text-xl sm:text-2xl font-bold text-center mb-1 xs:mb-2 ${
          isPremium ? 'text-yellow-900' : 'text-zinc-900'
        }`}
      >
        {product.name}
      </h2>
      <span
        className={`text-base xs:text-lg sm:text-xl font-bold text-center mb-2 xs:mb-3 sm:mb-4 ${
          isPremium ? 'text-yellow-900' : 'text-zinc-900'
        }`}
      >
        {product.price.toFixed(2)}zł
      </span>
      <p
        className={`text-xs xs:text-sm sm:text-base text-center mb-3 xs:mb-4 sm:mb-6 ${
          isPremium ? 'text-yellow-900' : 'text-zinc-500'
        }`}
      >
        {product.description}
      </p>
      <form action={createCheckoutSession} className="mt-auto">
        <input type="hidden" name="productId" value={product.id} />
        <SubmitButton label="Wspieram" loading="Wsparcie w trakcie..." />
      </form>
    </div>
  )
}
