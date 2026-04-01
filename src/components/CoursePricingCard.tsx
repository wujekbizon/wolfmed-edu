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
  badge?: string
  alreadyOwned?: boolean
}

export default function CoursePricingCard({
  tierName,
  price,
  priceId,
  courseSlug,
  accessTier,
  features,
  isPremium = false,
  badge,
  alreadyOwned
}: CoursePricingCardProps) {
  const [state, action] = useActionState(createCheckoutSession, EMPTY_FORM_STATE)

  const isOwned = alreadyOwned
  const isSoon =
    (courseSlug === 'pielegniarstwo' && isPremium) ||
    (courseSlug === 'opiekun-medyczny' && isPremium)

  const isDisabled = isOwned || isSoon

  const label = isOwned
    ? 'W posiadaniu'
    : isSoon
      ? 'Wkrótce dostępne'
      : 'Kup teraz'

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
          <p className="text-3xl md:text-4xl font-bold tracking-tight text-slate-700">
            {price}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {isPremium ? 'Całe aktualne i przyszłe treści kursu + AI' : 'Obejmuje aktualnie dostępne treści kursu'}
          </p>
        </div>

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

      <div className='mt-auto w-full pt-6 md:pt-8'>
          <form action={action}>
            <input type='hidden' name='courseSlug' value={courseSlug} />
            <input type='hidden' name='accessTier' value={accessTier} />
            <SubmitButton
              label={label}
              loading='Przekierowywanie...'
              disabled={isDisabled}
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
