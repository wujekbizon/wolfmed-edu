'use client'

import { usePlanComparisonStore } from '@/store/usePlanComparisonStore'
import { PLAN_COMPARISON_PANEL_ID } from '@/constants/planComparisonPanel'

export default function PlanComparisonToggle() {
  const isOpen = usePlanComparisonStore((state) => state.isOpen)
  const toggle = usePlanComparisonStore((state) => state.toggle)

  return (
    <div className='mt-10 flex justify-center'>
      <button
        type='button'
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={PLAN_COMPARISON_PANEL_ID}
        className='group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-rose-400 transition-colors hover:text-rose-300'
      >
        {isOpen ? 'Ukryj porównanie planów' : 'Zobacz pełne porównanie planów'}
        <span
          aria-hidden='true'
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
          }`}
        >
          ↓
        </span>
      </button>
    </div>
  )
}
