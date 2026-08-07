import SimplePathCard from '@/components/SimplePathCard'
import type { CardProps } from '@/constants/educationalPathCards'

export default function PathFeatures({ features }: { features: CardProps[] }) {
  return (
    <section aria-labelledby="features-title" className="w-full relative">
      <header className="mb-8 sm:mb-12 lg:mb-16 text-center">
        <span className="inline-block rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
          Co oferujemy
        </span>
        <h2
          id="features-title"
          className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900"
        >
          Cechy kierunku i narzędzia
        </h2>
        <p className="mt-3 text-zinc-600 text-base md:text-lg">
          Praktyczne moduły i materiały, które realnie pomogą Ci w nauce i
          przygotowaniu do egzaminu.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <SimplePathCard key={index} {...feature} />
        ))}
      </div>
    </section>
  )
}
