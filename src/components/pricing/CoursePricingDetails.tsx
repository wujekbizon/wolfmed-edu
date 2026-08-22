import type { CoursePricingDetailsProps } from '@/types/paymentTypes'

export default function CoursePricingDetails({
  tierName,
  price,
  originalPrice,
  features,
  isPremium,
  badge,
}: CoursePricingDetailsProps) {
  return (
    <>
      {badge && (
        <span
          className={`self-end mb-4 inline-flex items-center gap-1.5 text-[11px] md:text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full ${
            isPremium
              ? 'bg-gradient-to-r from-slate-800 via-[#ff9898] to-[#ffc5c5] text-white shadow-md'
              : 'bg-slate-900/5 text-slate-700'
          }`}
        >
          {isPremium && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
          {badge}
        </span>
      )}
      <h3 className="text-xl md:text-2xl font-extrabold mb-2 text-slate-900 capitalize">
        {tierName}
      </h3>
      <div className="mb-4 md:mb-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {originalPrice && (
            <p className="text-lg md:text-xl font-semibold text-zinc-400 line-through decoration-2">
              <span className="sr-only">Cena regularna: </span>
              {originalPrice}
            </p>
          )}
          <p className="text-3xl md:text-4xl font-bold tracking-tight text-slate-700">
            {originalPrice && <span className="sr-only">Cena aktualizacji: </span>}
            {price}
          </p>
        </div>
        <p className="text-sm text-zinc-500 mt-1">
          {isPremium
            ? 'Całe aktualne i przyszłe treści kursu + AI'
            : 'Obejmuje aktualnie dostępne treści kursu'}
        </p>
      </div>
      <ul className="grow space-y-3 md:space-y-4 text-left w-full max-w-sm text-zinc-700">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-sm md:text-base leading-relaxed"
          >
            <svg
              className="mt-0.5 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
