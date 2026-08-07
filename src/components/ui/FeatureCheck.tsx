import type { ComparisonValue } from '@/types/pricingTypes'

export default function FeatureCheck({ value }: { value: ComparisonValue }) {
  if (typeof value === 'string') {
    return <span className="text-sm font-medium text-slate-700">{value}</span>
  }

  if (!value) {
    return (
      <span className="text-zinc-300" aria-label="Niedostępne">
        —
      </span>
    )
  }

  return (
    <svg
      className="mx-auto w-5 h-5 text-slate-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      role="img"
      aria-label="W planie"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
