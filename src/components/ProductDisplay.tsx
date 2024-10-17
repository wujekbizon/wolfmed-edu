import Link from 'next/link'
import ProductCard from './ProductCard'
import { products } from '@/constants/products'

export default function ProductDisplay() {
  return (
    <div className="w-full max-w-4xl bg-white/70 rounded-xl shadow-md shadow-zinc-500 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-center mb-3 xs:mb-4 sm:mb-6">
        Wybierz opcję wsparcia
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Link className="block w-full mt-3 xs:mt-4 sm:mt-6 text-center" href="/">
        <p className="text-xs xs:text-sm sm:text-base text-zinc-600 hover:text-zinc-800">Powrót do strony głównej</p>
      </Link>
    </div>
  )
}
