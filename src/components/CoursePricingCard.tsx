'use client'

import { useActionState } from 'react'
import { createCheckoutSession } from '@/actions/stripe'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import SubmitButton from './SubmitButton'

interface CoursePricingCardProps {
  tierName: string
  price: string
  priceId: string
  courseSlug: string
  accessTier: string
  features: string[]
  isPremium?: boolean
}

export default function CoursePricingCard({
  tierName,
  price,
  priceId,
  courseSlug,
  accessTier,
  features,
  isPremium = false,
}: CoursePricingCardProps) {
  const [state, action] = useActionState(createCheckoutSession, EMPTY_FORM_STATE)

  return (
    <article className="h-full">
      <div
        className={`
          h-full min-h-[480px] md:min-h-[560px] flex flex-col rounded-3xl p-6 sm:p-8 md:p-10
          transition-all duration-300
          ${
            isPremium
              ? 'bg-white ring-2 ring-slate-900/10 shadow-xl hover:shadow-2xl hover:-translate-y-1'
              : 'bg-white ring-1 ring-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          }
        `}
      >
        {isPremium && (
          <span className="self-end mb-2 text-[11px] md:text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full bg-slate-900/5 text-slate-700">
            Najlepszy wybór
          </span>
        )}

        <h3 className="text-xl md:text-2xl font-extrabold mb-2 text-slate-900 capitalize">
          {tierName}
        </h3>
        <p className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight text-slate-700">
          {price}
        </p>

        <ul className="grow space-y-3 md:space-y-4 text-left w-full max-w-sm text-zinc-700">
          {features.map((feature, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm md:text-base leading-relaxed"
            >
              <svg
                className="mt-0.5 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-slate-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {state.status === 'ERROR' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{state.message}</p>
          </div>
        )}

        <div className="mt-auto w-full pt-6 md:pt-8">
          <form action={action}>
            <input type="hidden" name="priceId" value={priceId} />
            <input type="hidden" name="courseSlug" value={courseSlug} />
            <input type="hidden" name="accessTier" value={accessTier} />
            <SubmitButton
              label="Kup teraz"
              loading="Przekierowywanie..."
              className={`
                ${
                  isPremium
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-700 text-white hover:bg-slate-800'
                }
              `}
            />
          </form>
        </div>
      </div>
    </article>
  )
}
