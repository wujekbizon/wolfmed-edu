'use client'

import Link from 'next/link'
import { CalendarClock, Flame, TrendingUp, ArrowRight } from 'lucide-react'
import type { PlanProgress } from '@/types/plannerTypes'
import { pluralizePl } from '@/helpers/pluralizePl'
import { formatMinutes } from '@/helpers/formatMinutes'
import { planCompletionPercent } from '@/helpers/planCompletionPercent'
import { PACE_CONFIG } from '@/constants/planner'
import StatTile from './planner/StatTile'

export default function AnalyticsPlanTab({ plan }: { plan: PlanProgress }) {
  const pace = PACE_CONFIG[plan.paceStatus]
  const completionPercent = planCompletionPercent(
    plan.attributedMinutes,
    plan.plannedTotalMinutes
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{plan.plan.name}</h3>
          <span
            className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pace.className}`}
          >
            {pace.label}
          </span>
        </div>
        <Link
          href="/panel/plan"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
        >
          Otwórz plan
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col xs:flex-row rounded-xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 overflow-hidden">
        <StatTile
          icon={CalendarClock}
          value={String(plan.daysLeft)}
          label={`${pluralizePl(plan.daysLeft, ['dzień', 'dni', 'dni'])} do końca`}
        />
        <StatTile
          icon={TrendingUp}
          value={`${completionPercent}%`}
          label={`${formatMinutes(plan.attributedMinutes)} z ${formatMinutes(plan.plannedTotalMinutes)}`}
        />
        <StatTile
          icon={Flame}
          value={String(plan.streak)}
          label={`${pluralizePl(plan.streak, ['dzień', 'dni', 'dni'])} z rzędu`}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <h4 className="text-sm font-semibold text-zinc-700">Zagadnienia w planie</h4>
          <span className="text-xs text-zinc-400 tabular-nums shrink-0">
            {plan.concepts.length}
          </span>
        </div>
        <ul className="space-y-2 max-h-72 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-webkit pr-2">
          {plan.concepts.map((concept) => {
            const spent = concept.autoMinutes + concept.manualMinutes
            const ratio = concept.targetMinutes > 0 ? Math.min(1, spent / concept.targetMinutes) : 0
            const done = Boolean(concept.completedAt)
            return (
              <li key={concept.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${done ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                    {concept.label}
                  </p>
                  <div className="h-1.5 mt-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${done ? 'bg-emerald-400' : 'bg-gradient-to-r from-[#ff9898] to-red-500'}`}
                      style={{ width: `${Math.round(ratio * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-400 whitespace-nowrap tabular-nums">
                  {spent}/{concept.targetMinutes} min
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
