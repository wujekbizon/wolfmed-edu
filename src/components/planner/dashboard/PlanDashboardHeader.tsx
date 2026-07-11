'use client'

import Link from 'next/link'
import { Settings2 } from 'lucide-react'
import { PACE_CONFIG } from '@/constants/planner'
import type { PlanProgress } from '@/types/plannerTypes'

export default function PlanDashboardHeader({
  plan,
  paceStatus,
  showSettings,
  onToggleSettings,
}: {
  plan: PlanProgress['plan']
  paceStatus: PlanProgress['paceStatus']
  showSettings: boolean
  onToggleSettings: () => void
}) {
  const pace = PACE_CONFIG[paceStatus]

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{plan.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {plan.focusLabel && (
            <Link
              href={`/panel/kursy/${encodeURIComponent(plan.focusCategoryKey ?? '')}`}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
            >
              {plan.focusLabel}
            </Link>
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pace.className}`}>
            {pace.label}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleSettings}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-500 border border-zinc-200 hover:border-zinc-400 transition-colors"
      >
        <Settings2 className="w-3.5 h-3.5" />
        {showSettings ? 'Zamknij' : 'Ustawienia'}
      </button>
    </div>
  )
}
